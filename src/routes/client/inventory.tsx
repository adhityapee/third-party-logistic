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
import { storeName } from "@/components/dc/selectors"
import { EmptyState } from "@/components/dc/empty-state"
import {
  selectInferredStockForClient,
  selectSkuById,
  useMockStore,
} from "@/mocks/state"

export const Route = createFileRoute("/client/inventory")({
  component: ClientInventoryPage,
})

function coverTone(days: number): { label: string; className: string } {
  if (days < 3)
    return { label: "Critical", className: "bg-destructive/10 text-destructive" }
  if (days < 7)
    return {
      label: "Low",
      className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    }
  return {
    label: "Healthy",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  }
}

function ClientInventoryPage() {
  const state = useMockStore()
  const stores = useMockStore((s) => s.stores)
  const clientId =
    state.currentTenantScope !== "all" ? state.currentTenantScope : "client-renyah"

  const rows = React.useMemo(() => {
    return selectInferredStockForClient(state, clientId)
      .map((row) => ({
        ...row,
        sku: selectSkuById(state, row.sku_id),
      }))
      .sort((a, b) => a.days_of_cover - b.days_of_cover)
  }, [state, clientId])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Inventory
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Inferred on-hand stock for your SKUs across stores, sorted by lowest
            cover first.
          </p>
        </div>
        <Badge variant="secondary" className="font-normal">
          {rows.length} positions
        </Badge>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="No inventory signal"
          description="The engine has not computed inferred stock for your SKUs yet."
        />
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-right">Days of cover</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const tone = coverTone(row.days_of_cover)
                return (
                  <TableRow key={`${row.store_id}-${row.sku_id}`}>
                    <TableCell className="font-medium">
                      {storeName(stores, row.store_id)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{row.sku?.name ?? row.sku_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.sku?.code}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {row.on_hand_estimate}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="ghost" className={tone.className}>
                        {row.days_of_cover.toFixed(1)} d, {tone.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
