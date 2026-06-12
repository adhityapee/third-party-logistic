import { Outlet, createFileRoute } from "@tanstack/react-router"

import { EmptyState } from "@/components/dc/empty-state"
import { assertTenantAccess, getLockedClientId } from "@/lib/permissions"
import { useMockStore } from "@/mocks/state"

export const Route = createFileRoute("/client")({
  component: ClientLayout,
})

function ClientLayout() {
  const role = useMockStore((s) => s.currentRole)
  const tenantScope = useMockStore((s) => s.currentTenantScope)
  const users = useMockStore((s) => s.users)
  const lockedClientId = getLockedClientId(
    users.find((u) => u.role === "client")
  )

  if (!assertTenantAccess(role, tenantScope, lockedClientId)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
        <EmptyState
          title="Access restricted"
          description="This portal is scoped to your client account. Switch back to your assigned client to view it."
        />
      </div>
    )
  }

  return <Outlet />
}
