import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { canSwitchTenant } from "@/lib/permissions"
import { useMockStore } from "@/mocks/state"

export function TenantSwitcher() {
  const role = useMockStore((s) => s.currentRole)
  const scope = useMockStore((s) => s.currentTenantScope)
  const setScope = useMockStore((s) => s.setCurrentTenantScope)
  const clients = useMockStore((s) => s.clients)

  if (!canSwitchTenant(role)) return null

  const current = clients.find((c) => c.id === scope)

  return (
    <Select
      value={scope}
      onValueChange={(value) => {
        if (value) setScope(value)
      }}
    >
      <SelectTrigger size="sm" aria-label="Switch client" className="min-w-44">
        <SelectValue>
          <span className="font-medium">
            {current ? current.name : "All clients"}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          <span className="font-medium">All clients</span>
        </SelectItem>
        {clients.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            <span className="font-medium">{c.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
