import { useShallow } from "zustand/react/shallow"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatRelative } from "@/components/dc/format"
import { selectOrderSLA, useMockStore } from "@/mocks/state"
import type { SLAStatus } from "@/mocks/types"

const slaTone: Record<SLAStatus, { label: string; className: string }> = {
  on_track: {
    label: "On track",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  at_risk: {
    label: "At risk",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  breached: {
    label: "Breached",
    className: "bg-destructive/10 text-destructive",
  },
}

export function SLABadge({
  orderId,
  className,
  showDue = true,
}: {
  orderId: string
  className?: string
  showDue?: boolean
}) {
  const sla = useMockStore(useShallow((s) => selectOrderSLA(s, orderId)))
  if (!sla.contract) return null
  const tone = slaTone[sla.status]
  return (
    <Badge variant="ghost" className={cn(tone.className, className)}>
      {tone.label}
      {showDue && sla.dueAt ? `, due ${formatRelative(sla.dueAt)}` : null}
    </Badge>
  )
}
