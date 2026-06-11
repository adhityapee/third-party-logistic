import type { SLAContract } from '../types'

export const slaContracts: SLAContract[] = [
  {
    id: 'sla-renyah',
    client_id: 'client-renyah',
    tier: 'priority',
    promised_delivery_hours: 12,
    target_on_time_pct: 95,
  },
  {
    id: 'sla-segar',
    client_id: 'client-segar',
    tier: 'standard',
    promised_delivery_hours: 24,
    target_on_time_pct: 90,
  },
  {
    id: 'sla-bersih',
    client_id: 'client-bersih',
    tier: 'express',
    promised_delivery_hours: 6,
    target_on_time_pct: 98,
  },
]
