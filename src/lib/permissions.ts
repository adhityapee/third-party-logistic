import type { Role, User } from "@/mocks/types"

export function canSwitchTenant(role: Role): boolean {
  return role === "ops-manager" || role === "supervisor" || role === "exec"
}

export function getLockedClientId(user: User | undefined): string | undefined {
  return user?.client_ids?.[0]
}

export function canConfirmOrders(role: Role): boolean {
  return role === "ops-manager" || role === "supervisor"
}

export function canDispatchWave(role: Role): boolean {
  return role === "ops-manager"
}

export function canEditCatalog(role: Role): boolean {
  return role === "ops-manager"
}

export type Permission =
  | "confirm_orders"
  | "dispatch_wave"
  | "edit_catalog"
  | "switch_tenant"

export function canPerform(role: Role, permission: Permission): boolean {
  switch (permission) {
    case "confirm_orders":
      return canConfirmOrders(role)
    case "dispatch_wave":
      return canDispatchWave(role)
    case "edit_catalog":
      return canEditCatalog(role)
    case "switch_tenant":
      return canSwitchTenant(role)
  }
}

// Client personas are locked to their own tenant scope. Other roles can browse
// any scope (including "all"), so access is only restricted for role === 'client'.
export function assertTenantAccess(
  role: Role,
  tenantScope: string,
  lockedClientId: string | undefined
): boolean {
  if (role !== "client") return true
  return Boolean(lockedClientId) && tenantScope === lockedClientId
}
