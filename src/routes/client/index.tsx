import { createFileRoute } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  selectClientById,
  selectInferredStockForClient,
  selectOrderSLA,
  selectOrdersForClient,
  selectSLAContractForClient,
  useMockStore,
} from "@/mocks/state"
import type { SLATier } from "@/mocks/types"

export const Route = createFileRoute("/client/")({ component: ClientOverviewPage })

const TIER_LABEL: Record<SLATier, string> = {
  standard: "Standard",
  priority: "Priority",
  express: "Express",
}

const STOCK_OUT_THRESHOLD_DAYS = 3

function ClientOverviewPage() {
  const state = useMockStore()
  const clientId =
    state.currentTenantScope !== "all" ? state.currentTenantScope : "client-renyah"
  const client = selectClientById(state, clientId)
  const contract = selectSLAContractForClient(state, clientId)
  const orders = selectOrdersForClient(state, clientId)
  const stock = selectInferredStockForClient(state, clientId)

  const slaResults = orders.map((o) => selectOrderSLA(state, o.id))
  const onTrackCount = slaResults.filter((s) => s.status === "on_track").length
  const atRiskCount = slaResults.filter((s) => s.status === "at_risk").length
  const breachedCount = slaResults.filter((s) => s.status === "breached").length
  const onTimePct =
    slaResults.length > 0
      ? Math.round((onTrackCount / slaResults.length) * 1000) / 10
      : 100

  const stockOutCount = stock.filter(
    (s) => s.days_of_cover < STOCK_OUT_THRESHOLD_DAYS,
  ).length
  const stockOutPct =
    stock.length > 0 ? Math.round((stockOutCount / stock.length) * 1000) / 10 : 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {client?.name ?? "Client overview"}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Fulfillment performance for SKUs under {client?.name ?? "your"}{" "}
          contract, across all distribution centers.
        </p>
      </header>

      <section
        aria-label="Contract and KPIs"
        className="grid grid-cols-1 gap-3 lg:grid-cols-3"
      >
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardDescription className="text-xs tracking-wide uppercase">
              Service contract
            </CardDescription>
            <CardTitle className="font-heading text-lg font-medium">
              {contract ? TIER_LABEL[contract.tier] : "No contract"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Promised delivery</span>
              <span className="font-medium tabular-nums">
                {contract ? `${contract.promised_delivery_hours} h` : "n/a"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">On-time target</span>
              <span className="font-medium tabular-nums">
                {contract ? `${contract.target_on_time_pct}%` : "n/a"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Contact</span>
              <span className="font-medium">{client?.contact_name ?? "n/a"}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-2">
          <SmallKpi
            label="On-time delivery"
            value={`${onTimePct}%`}
            tone={
              contract && onTimePct < contract.target_on_time_pct ? "warn" : "ok"
            }
            hint={
              contract
                ? `Target ${contract.target_on_time_pct}%, this period`
                : "All orders, this period"
            }
          />
          <SmallKpi
            label="SLA at risk or breached"
            value={`${atRiskCount + breachedCount}`}
            tone={atRiskCount + breachedCount > 0 ? "warn" : "ok"}
            hint={`${breachedCount} breached, ${atRiskCount} at risk`}
          />
          <SmallKpi
            label="SKUs below cover"
            value={`${stockOutPct}%`}
            tone={stockOutCount > 0 ? "warn" : "ok"}
            hint={`${stockOutCount} of ${stock.length} SKUs under ${STOCK_OUT_THRESHOLD_DAYS} days`}
          />
        </div>
      </section>

      <section aria-label="Order summary" className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">Orders</h2>
            <p className="text-sm text-muted-foreground">
              All store orders containing your SKUs.
            </p>
          </div>
          <Badge variant="secondary" className="font-normal">
            {orders.length} orders
          </Badge>
        </div>
        <Card size="sm" className="shadow-none ring-1 ring-border">
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatusCount label="Confirmed" count={countByStatus(orders, "confirmed")} />
            <StatusCount label="In transit" count={countByStatus(orders, "in_transit")} />
            <StatusCount label="Delivered" count={countByStatus(orders, "delivered")} />
            <StatusCount label="Exceptions" count={countByStatus(orders, "exception")} />
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function countByStatus(
  orders: ReturnType<typeof selectOrdersForClient>,
  status: string,
): number {
  return orders.filter((o) => o.status === status).length
}

function StatusCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-heading text-2xl font-semibold tabular-nums">
        {count}
      </span>
    </div>
  )
}

function SmallKpi({
  label,
  value,
  tone,
  hint,
}: {
  label: string
  value: string
  tone: "ok" | "warn"
  hint: string
}) {
  const colorClass =
    tone === "warn"
      ? "text-amber-700 dark:text-amber-300"
      : "text-emerald-700 dark:text-emerald-300"
  return (
    <Card size="sm" className="shadow-none ring-1 ring-border">
      <CardContent className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`font-heading text-2xl font-semibold tabular-nums ${colorClass}`}>
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  )
}
