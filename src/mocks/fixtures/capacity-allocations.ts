import type { CapacityAllocation } from '../types'

export const capacityAllocations: CapacityAllocation[] = [
  { id: 'cap-jkt-renyah', zone_id: 'zone-jkt-renyah', allocated_units: 4000, used_units: 3400 },
  { id: 'cap-jkt-segar', zone_id: 'zone-jkt-segar', allocated_units: 5000, used_units: 4750 },
  { id: 'cap-jkt-bersih', zone_id: 'zone-jkt-bersih', allocated_units: 3000, used_units: 2100 },
  { id: 'cap-bdg-renyah', zone_id: 'zone-bdg-renyah', allocated_units: 2500, used_units: 2025 },
  { id: 'cap-bdg-segar', zone_id: 'zone-bdg-segar', allocated_units: 3500, used_units: 3640 },
  { id: 'cap-bdg-bersih', zone_id: 'zone-bdg-bersih', allocated_units: 2000, used_units: 1200 },
]
