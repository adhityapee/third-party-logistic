import { createFileRoute } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress"
import { ClientBadge } from "@/components/shared/client-badge"
import { getActiveDcId } from "@/components/dc/selectors"
import {
  selectCapacityAllocationsForDC,
  selectCapacityAlerts,
  useMockStore,
} from "@/mocks/state"

export const Route = createFileRoute("/allocation")({ component: AllocationPage })

function AllocationPage() {
  const state = useMockStore()
  const activeDcId = getActiveDcId(state)
  const dc = state.dcs.find((d) => d.id === activeDcId)
  const zones = selectCapacityAllocationsForDC(state, activeDcId)
  const alerts = selectCapacityAlerts(state)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          Allocation
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Warehouse capacity committed to each client, against units currently
          in use.
        </p>
      </header>

      {alerts.length > 0 ? (
        <Card className="mb-6 border-amber-500/40 bg-amber-500/5">
          <CardContent className="py-4 text-sm">
            <div className="font-medium text-amber-700 dark:text-amber-300">
              {alerts.length} zone{alerts.length === 1 ? "" : "s"} at or above 90%
              utilization
            </div>
            <ul className="mt-2 space-y-1 text-muted-foreground">
              {alerts.map((a) => (
                <li key={a.zone.id} className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {a.zone.name}
                  </span>
                  <span>
                    {a.used.toLocaleString("id-ID")} /{" "}
                    {a.allocated.toLocaleString("id-ID")} units, {a.pct}%
                  </span>
                  {a.pct > 100 ? (
                    <Badge variant="ghost" className="bg-destructive/10 text-destructive">
                      Over capacity
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <section aria-label="Zones for active distribution center" className="grid gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">
              {dc?.name ?? activeDcId}
            </h2>
            <p className="text-sm text-muted-foreground">
              Capacity allocated per client zone in this distribution center.
            </p>
          </div>
          <Badge variant="secondary" className="font-normal">
            {zones.length} zones
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((z) => {
            const overCapacity = z.pct > 100
            return (
              <Card key={z.zone.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardDescription className="text-xs tracking-wide uppercase">
                      {z.zone.code}
                    </CardDescription>
                    <ClientBadge clientId={z.client?.id} />
                  </div>
                  <CardTitle className="font-heading text-lg font-medium">
                    {z.client?.name ?? z.zone.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Progress value={Math.min(z.pct, 100)}>
                    <ProgressTrack>
                      <ProgressIndicator
                        className={overCapacity ? "bg-destructive" : undefined}
                      />
                    </ProgressTrack>
                  </Progress>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {z.used.toLocaleString("id-ID")} /{" "}
                      {z.allocated.toLocaleString("id-ID")} units
                    </span>
                    <span className="font-medium tabular-nums">{z.pct}%</span>
                  </div>
                  {overCapacity ? (
                    <Badge
                      variant="ghost"
                      className="w-fit bg-destructive/10 text-destructive"
                    >
                      Over capacity
                    </Badge>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
