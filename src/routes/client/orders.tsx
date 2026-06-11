import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/dc/status-badge"
import { EmptyState } from "@/components/dc/empty-state"
import { formatClock } from "@/components/dc/format"
import { storeName } from "@/components/dc/selectors"
import { SLABadge } from "@/components/shared/sla-badge"
import { selectOrdersForClient, useMockStore } from "@/mocks/state"

export const Route = createFileRoute("/client/orders")({
  component: ClientOrdersPage,
})

function ClientOrdersPage() {
  const state = useMockStore()
  const stores = useMockStore((s) => s.stores)
  const clientId =
    state.currentTenantScope !== "all" ? state.currentTenantScope : "client-renyah"

  const orders = React.useMemo(() => {
    return [...selectOrdersForClient(state, clientId)].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }, [state, clientId])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Orders
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Store orders containing your SKUs, with delivery status against
            your service level contract.
          </p>
        </div>
        <Badge variant="secondary" className="font-normal">
          {orders.length} orders
        </Badge>
      </header>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders containing your SKUs will appear here once stores submit them."
        />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Delivered at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="font-medium">{storeName(stores, o.store_id)}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.id.slice(0, 16)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell>
                    <SLABadge orderId={o.id} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {o.delivered_at ? formatClock(o.delivered_at) : "Pending"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
