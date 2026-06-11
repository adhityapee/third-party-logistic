import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useMockStore } from "@/mocks/state"
import type { SKUCategory } from "@/mocks/types"

const categoryTone: Record<SKUCategory, string> = {
  snacks: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  beverages: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  toiletries: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export function ClientBadge({
  clientId,
  className,
}: {
  clientId: string | undefined
  className?: string
}) {
  const client = useMockStore((s) => s.clients.find((c) => c.id === clientId))
  if (!client) return null
  return (
    <Badge variant="ghost" className={cn(categoryTone[client.category], className)}>
      {client.code}
    </Badge>
  )
}
