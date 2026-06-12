export type Role =
  | "ops-manager"
  | "store"
  | "driver"
  | "supervisor"
  | "exec"
  | "client"

export type ScenarioId =
  | "calm-tuesday"
  | "exception-friday"
  | "end-of-month-surge"

export type TenantScope = "all" | string

export type SLATier = "standard" | "priority" | "express"

export type SLAStatus = "on_track" | "at_risk" | "breached"

export type OrderStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "picking"
  | "picked"
  | "in_transit"
  | "delivered"
  | "exception"
  | "closed"

export type ExceptionReason =
  | "store_closed"
  | "refused"
  | "damaged"
  | "address_wrong"
  | "other"

export type OrderSource = "engine" | "store" | "manual"

export type WaveStatus = "building" | "dispatched" | "in_transit" | "completed"

export type SKUCategory = "snacks" | "beverages" | "toiletries"

export interface DC {
  id: string
  name: string
  address: string
  region: string
}

export interface Store {
  id: string
  name: string
  address: string
  contact: string
  home_dc_id: string
  cluster_id: string
}

export interface SKU {
  id: string
  code: string
  name: string
  category: SKUCategory
  client_id: string
  default_burn_per_day: number
  reorder_threshold_days: number
  unit_price_idr: number
}

export interface Client {
  id: string
  name: string
  code: string
  category: SKUCategory
  contact_name: string
  contact_email: string
}

export interface SLAContract {
  id: string
  client_id: string
  tier: SLATier
  promised_delivery_hours: number
  target_on_time_pct: number
}

export interface WarehouseZone {
  id: string
  dc_id: string
  client_id: string
  name: string
  code: string
}

export interface CapacityAllocation {
  id: string
  zone_id: string
  allocated_units: number
  used_units: number
}

export interface InferredStock {
  store_id: string
  sku_id: string
  client_id: string
  on_hand_estimate: number
  last_recompute_at: string
  days_of_cover: number
}

export interface OrderLine {
  order_id: string
  sku_id: string
  suggested_qty: number
  requested_qty: number
  delivered_qty: number
}

export interface Order {
  id: string
  store_id: string
  status: OrderStatus
  created_at: string
  source: OrderSource
  wave_id?: string
  edited_by_store?: boolean
  note?: string
  arrived_at?: string
  delivered_at?: string
  flagged_reason?: string
}

export interface Wave {
  id: string
  dc_id: string
  dispatch_date: string
  status: WaveStatus
  truck_id?: string
  driver_user_id?: string
  order_ids: string[]
}

export interface Truck {
  id: string
  dc_id: string
  plate: string
  capacity: number
}

export interface User {
  id: string
  role: Role
  name: string
  phone: string
  dc_id?: string
  store_id?: string
  cluster_id?: string
  client_ids?: string[]
}

export interface Exception {
  id: string
  order_id: string
  reason_code: ExceptionReason
  note: string
  photo_url: string
  created_by: string
  created_at: string
}

export interface POD {
  id: string
  order_id: string
  photo_url: string
  signature_url: string
  captured_by: string
  captured_at: string
}
