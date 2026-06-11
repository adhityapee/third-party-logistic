import { useNavigate } from "@tanstack/react-router"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getLockedClientId } from "@/lib/permissions"
import { useMockStore } from "@/mocks/state"
import type { Role } from "@/mocks/types"

const ROLES: { id: Role; persona: string; title: string; home: string }[] = [
  { id: "ops-manager", persona: "Rina", title: "DC Ops Manager", home: "/" },
  { id: "supervisor", persona: "Sari", title: "Regional Supervisor", home: "/supervisor" },
  { id: "exec", persona: "Pak Hadi", title: "Head of Supply Chain", home: "/exec" },
  { id: "store", persona: "Budi", title: "Store Owner", home: "/store" },
  { id: "driver", persona: "Andi", title: "Driver", home: "/driver" },
  { id: "client", persona: "Pak Yanto", title: "Client Ops Lead, Renyah Group", home: "/client" },
]

export function RoleSwitcher() {
  const role = useMockStore((s) => s.currentRole)
  const setRole = useMockStore((s) => s.setCurrentRole)
  const setTenantScope = useMockStore((s) => s.setCurrentTenantScope)
  const users = useMockStore((s) => s.users)
  const navigate = useNavigate()
  const current = ROLES.find((r) => r.id === role) ?? ROLES[0]

  return (
    <Select
      value={role}
      onValueChange={(value) => {
        if (!value) return
        setRole(value)
        if (value === "client") {
          const clientUser = users.find((u) => u.role === "client")
          setTenantScope(getLockedClientId(clientUser) ?? "all")
        } else if (role === "client") {
          setTenantScope("all")
        }
        const next = ROLES.find((r) => r.id === value)
        if (next) navigate({ to: next.home })
      }}
    >
      <SelectTrigger size="sm" aria-label="Switch persona" className="min-w-52">
        <SelectValue>
          <span className="font-medium">{current.persona}</span>
          <span className="text-muted-foreground">, {current.title}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            <span className="font-medium">{r.persona}</span>
            <span className="text-muted-foreground">, {r.title}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
