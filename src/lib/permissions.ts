import type { Role, User } from '@/mocks/types'

export function canSwitchTenant(role: Role): boolean {
  return role === 'ops-manager' || role === 'supervisor' || role === 'exec'
}

export function getLockedClientId(user: User | undefined): string | undefined {
  return user?.client_ids?.[0]
}
