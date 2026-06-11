import { create } from 'zustand'
import type {
  CapacityAllocation,
  Client,
  DC,
  Exception,
  InferredStock,
  Order,
  OrderLine,
  OrderStatus,
  POD,
  Role,
  SKU,
  SLAContract,
  SLAStatus,
  ScenarioId,
  Store,
  TenantScope,
  Truck,
  User,
  Wave,
  WarehouseZone,
} from './types'
import { CATEGORY_TO_CLIENT } from './fixtures/clients'
import calmTuesday from './scenarios/calm-tuesday'
import exceptionFriday from './scenarios/exception-friday'
import endOfMonthSurge from './scenarios/end-of-month-surge'
import { getDemoNow } from './clock'

export interface MockDataSlice {
  dcs: DC[]
  stores: Store[]
  skus: SKU[]
  inferredStock: InferredStock[]
  orders: Order[]
  orderLines: OrderLine[]
  waves: Wave[]
  trucks: Truck[]
  users: User[]
  exceptions: Exception[]
  pods: POD[]
  clients: Client[]
  slaContracts: SLAContract[]
  warehouseZones: WarehouseZone[]
  capacityAllocations: CapacityAllocation[]
}

export interface ConfirmOrdersInput {
  orderIds: string[]
}

export interface CreateWaveInput {
  dcId: string
  dispatchDate: string
  truckId?: string
  driverUserId?: string
  orderIds: string[]
}

export interface AssignWaveInput {
  waveId: string
  truckId?: string
  driverUserId?: string
}

export interface DispatchWaveInput {
  waveId: string
}

export interface MarkStopArrivedInput {
  orderId: string
}

export interface DeliverStopInput {
  orderId: string
  lines: Array<{ skuId: string; deliveredQty: number }>
  podPhotoUrl?: string
  podSignatureUrl?: string
  capturedBy: string
}

export interface ReportExceptionInput {
  orderId: string
  reasonCode: import('./types').ExceptionReason
  note?: string
  photoUrl?: string
  createdBy: string
}

export interface EditOrderLineInput {
  orderId: string
  skuId: string
  requestedQty: number
}

export interface RemoveOrderLineInput {
  orderId: string
  skuId: string
}

export interface SubmitStoreOrderInput {
  orderId: string
  note?: string
}

export interface MarkStoreReceivedInput {
  orderId: string
  podPhotoUrl?: string
  capturedBy: string
}

export interface UpsertSkuInput {
  id?: string
  code: string
  name: string
  category: import('./types').SKUCategory
  default_burn_per_day: number
  reorder_threshold_days: number
  unit_price_idr: number
}

export interface MockState extends MockDataSlice {
  currentRole: Role
  currentScenario: ScenarioId
  currentTenantScope: TenantScope

  setCurrentRole: (role: Role) => void
  setCurrentScenario: (id: ScenarioId) => void
  setCurrentTenantScope: (scope: TenantScope) => void
  resetToScenario: (id: ScenarioId) => void

  // DC Ops actions
  confirmOrders: (input: ConfirmOrdersInput) => void
  flagOrderForReview: (orderId: string, reason: string) => void
  createWave: (input: CreateWaveInput) => string
  assignWave: (input: AssignWaveInput) => void
  dispatchWave: (input: DispatchWaveInput) => void
  rescheduleOrder: (orderId: string, newDate: string) => void
  reassignOrderToWave: (orderId: string, newWaveId: string) => void
  closeException: (exceptionId: string) => void
  closeDay: (dcId: string) => void

  // Driver actions
  markStopArrived: (input: MarkStopArrivedInput) => void
  deliverStop: (input: DeliverStopInput) => void
  reportException: (input: ReportExceptionInput) => void

  // Store actions
  editOrderLine: (input: EditOrderLineInput) => void
  removeOrderLine: (input: RemoveOrderLineInput) => void
  submitStoreOrder: (input: SubmitStoreOrderInput) => void
  markStoreReceived: (input: MarkStoreReceivedInput) => void

  // Catalog actions
  upsertSku: (input: UpsertSkuInput) => SKU
  deleteSku: (skuId: string) => void
}

const SCENARIOS: Record<ScenarioId, MockDataSlice> = {
  'calm-tuesday': calmTuesday,
  'exception-friday': exceptionFriday,
  'end-of-month-surge': endOfMonthSurge,
}

function cloneSlice(slice: MockDataSlice): MockDataSlice {
  return {
    dcs: slice.dcs.map((x) => ({ ...x })),
    stores: slice.stores.map((x) => ({ ...x })),
    skus: slice.skus.map((x) => ({ ...x })),
    inferredStock: slice.inferredStock.map((x) => ({ ...x })),
    orders: slice.orders.map((x) => ({ ...x })),
    orderLines: slice.orderLines.map((x) => ({ ...x })),
    waves: slice.waves.map((x) => ({ ...x, order_ids: [...x.order_ids] })),
    trucks: slice.trucks.map((x) => ({ ...x })),
    users: slice.users.map((x) => ({ ...x })),
    exceptions: slice.exceptions.map((x) => ({ ...x })),
    pods: slice.pods.map((x) => ({ ...x })),
    clients: slice.clients.map((x) => ({ ...x })),
    slaContracts: slice.slaContracts.map((x) => ({ ...x })),
    warehouseZones: slice.warehouseZones.map((x) => ({ ...x })),
    capacityAllocations: slice.capacityAllocations.map((x) => ({ ...x })),
  }
}

const DEFAULT_SCENARIO: ScenarioId = 'calm-tuesday'
const DEFAULT_ROLE: Role = 'ops-manager'

function nowIso(): string {
  return getDemoNow().toISOString()
}

function nextId(prefix: string, existing: ReadonlyArray<{ id: string }>): string {
  const base = `${prefix}-${getDemoNow().getTime().toString(36)}`
  let i = 1
  let candidate = `${base}-${i}`
  const taken = new Set(existing.map((x) => x.id))
  while (taken.has(candidate)) {
    i += 1
    candidate = `${base}-${i}`
  }
  return candidate
}

export const useMockStore = create<MockState>((set, get) => ({
  ...cloneSlice(SCENARIOS[DEFAULT_SCENARIO]),
  currentRole: DEFAULT_ROLE,
  currentScenario: DEFAULT_SCENARIO,
  currentTenantScope: 'all',

  setCurrentRole: (role) => set({ currentRole: role }),
  setCurrentScenario: (id) => {
    get().resetToScenario(id)
  },
  setCurrentTenantScope: (scope) => set({ currentTenantScope: scope }),
  resetToScenario: (id) => {
    set({
      ...cloneSlice(SCENARIOS[id]),
      currentScenario: id,
    })
  },

  confirmOrders: ({ orderIds }) => {
    const ids = new Set(orderIds)
    set((state) => ({
      orders: state.orders.map((o) =>
        ids.has(o.id) && (o.status === 'submitted' || o.status === 'draft')
          ? { ...o, status: 'confirmed' as OrderStatus, flagged_reason: undefined }
          : o,
      ),
    }))
  },

  flagOrderForReview: (orderId, reason) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, flagged_reason: reason } : o,
      ),
    }))
  },

  createWave: ({ dcId, dispatchDate, truckId, driverUserId, orderIds }) => {
    const state = get()
    const id = nextId('wave', state.waves)
    const wave: Wave = {
      id,
      dc_id: dcId,
      dispatch_date: dispatchDate,
      status: 'building',
      truck_id: truckId,
      driver_user_id: driverUserId,
      order_ids: [...orderIds],
    }
    set({
      waves: [...state.waves, wave],
      orders: state.orders.map((o) =>
        orderIds.includes(o.id) ? { ...o, wave_id: id } : o,
      ),
    })
    return id
  },

  assignWave: ({ waveId, truckId, driverUserId }) => {
    set((state) => ({
      waves: state.waves.map((w) =>
        w.id === waveId
          ? {
              ...w,
              truck_id: truckId !== undefined ? truckId : w.truck_id,
              driver_user_id:
                driverUserId !== undefined ? driverUserId : w.driver_user_id,
            }
          : w,
      ),
    }))
  },

  dispatchWave: ({ waveId }) => {
    set((state) => {
      const wave = state.waves.find((w) => w.id === waveId)
      if (!wave) return state
      const orderIds = new Set(wave.order_ids)
      return {
        waves: state.waves.map((w) =>
          w.id === waveId ? { ...w, status: 'in_transit' as const } : w,
        ),
        orders: state.orders.map((o) =>
          orderIds.has(o.id) && o.status !== 'delivered' && o.status !== 'exception'
            ? { ...o, status: 'in_transit' as OrderStatus }
            : o,
        ),
      }
    })
  },

  rescheduleOrder: (orderId, newDate) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              wave_id: undefined,
              status: 'confirmed' as OrderStatus,
              note: `Rescheduled to ${newDate}`,
            }
          : o,
      ),
      waves: state.waves.map((w) => ({
        ...w,
        order_ids: w.order_ids.filter((id) => id !== orderId),
      })),
    }))
  },

  reassignOrderToWave: (orderId, newWaveId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, wave_id: newWaveId } : o,
      ),
      waves: state.waves.map((w) => {
        if (w.id === newWaveId) {
          return w.order_ids.includes(orderId)
            ? w
            : { ...w, order_ids: [...w.order_ids, orderId] }
        }
        return { ...w, order_ids: w.order_ids.filter((id) => id !== orderId) }
      }),
    }))
  },

  closeException: (exceptionId) => {
    set((state) => ({
      exceptions: state.exceptions.filter((e) => e.id !== exceptionId),
    }))
  },

  closeDay: (dcId) => {
    set((state) => {
      const dcStoreIds = new Set(
        state.stores.filter((s) => s.home_dc_id === dcId).map((s) => s.id),
      )
      return {
        orders: state.orders.map((o) =>
          dcStoreIds.has(o.store_id) && o.status === 'delivered'
            ? { ...o, status: 'closed' as OrderStatus }
            : o,
        ),
      }
    })
  },

  markStopArrived: ({ orderId }) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, arrived_at: nowIso() } : o,
      ),
    }))
  },

  deliverStop: ({ orderId, lines, podPhotoUrl, podSignatureUrl, capturedBy }) => {
    set((state) => {
      const deliveredAt = nowIso()
      const lineMap = new Map(lines.map((l) => [l.skuId, l.deliveredQty]))
      const nextLines = state.orderLines.map((line) =>
        line.order_id === orderId && lineMap.has(line.sku_id)
          ? { ...line, delivered_qty: lineMap.get(line.sku_id) ?? line.delivered_qty }
          : line,
      )
      const pod: POD = {
        id: nextId('pod', state.pods),
        order_id: orderId,
        photo_url: podPhotoUrl ?? '',
        signature_url: podSignatureUrl ?? '',
        captured_by: capturedBy,
        captured_at: deliveredAt,
      }
      return {
        orders: state.orders.map((o) =>
          o.id === orderId
            ? { ...o, status: 'delivered' as OrderStatus, delivered_at: deliveredAt }
            : o,
        ),
        orderLines: nextLines,
        pods: [...state.pods, pod],
      }
    })
  },

  reportException: ({ orderId, reasonCode, note, photoUrl, createdBy }) => {
    set((state) => {
      const exception: Exception = {
        id: nextId('exc', state.exceptions),
        order_id: orderId,
        reason_code: reasonCode,
        note: note ?? '',
        photo_url: photoUrl ?? '',
        created_by: createdBy,
        created_at: nowIso(),
      }
      return {
        exceptions: [exception, ...state.exceptions],
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'exception' as OrderStatus } : o,
        ),
      }
    })
  },

  editOrderLine: ({ orderId, skuId, requestedQty }) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, edited_by_store: true } : o,
      ),
      orderLines: state.orderLines.map((l) =>
        l.order_id === orderId && l.sku_id === skuId
          ? { ...l, requested_qty: requestedQty }
          : l,
      ),
    }))
  },

  removeOrderLine: ({ orderId, skuId }) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, edited_by_store: true } : o,
      ),
      orderLines: state.orderLines.filter(
        (l) => !(l.order_id === orderId && l.sku_id === skuId),
      ),
    }))
  },

  submitStoreOrder: ({ orderId, note }) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'submitted' as OrderStatus,
              note: note ?? o.note,
              source: 'store',
            }
          : o,
      ),
    }))
  },

  markStoreReceived: ({ orderId, podPhotoUrl, capturedBy }) => {
    set((state) => {
      const pod: POD = {
        id: nextId('pod-store', state.pods),
        order_id: orderId,
        photo_url: podPhotoUrl ?? '',
        signature_url: '',
        captured_by: capturedBy,
        captured_at: nowIso(),
      }
      return {
        orders: state.orders.map((o) =>
          o.id === orderId
            ? { ...o, status: 'delivered' as OrderStatus, delivered_at: nowIso() }
            : o,
        ),
        pods: [...state.pods, pod],
      }
    })
  },

  upsertSku: (input) => {
    const state = get()
    if (input.id) {
      const existing = state.skus.find((s) => s.id === input.id)
      if (existing) {
        const updated: SKU = {
          ...existing,
          ...input,
          id: existing.id,
          client_id: CATEGORY_TO_CLIENT[input.category],
        }
        set({
          skus: state.skus.map((s) => (s.id === existing.id ? updated : s)),
        })
        return updated
      }
    }
    const id = input.id ?? nextId('sku', state.skus)
    const created: SKU = {
      id,
      code: input.code,
      name: input.name,
      category: input.category,
      client_id: CATEGORY_TO_CLIENT[input.category],
      default_burn_per_day: input.default_burn_per_day,
      reorder_threshold_days: input.reorder_threshold_days,
      unit_price_idr: input.unit_price_idr,
    }
    set({ skus: [...state.skus, created] })
    return created
  },

  deleteSku: (skuId) => {
    set((state) => ({
      skus: state.skus.filter((s) => s.id !== skuId),
    }))
  },
}))

export function selectStoresForDC(state: MockState, dcId: string): Store[] {
  return state.stores.filter((s) => s.home_dc_id === dcId)
}

export function selectOrdersByStatus(state: MockState, status: OrderStatus): Order[] {
  return state.orders.filter((o) => o.status === status)
}

export function selectExceptionsToday(state: MockState): Exception[] {
  const now = getDemoNow()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return state.exceptions.filter((e) => new Date(e.created_at).getTime() >= startOfDay)
}

export function selectStoreById(state: MockState, id: string): Store | undefined {
  return state.stores.find((s) => s.id === id)
}

export function selectOrderById(state: MockState, id: string): Order | undefined {
  return state.orders.find((o) => o.id === id)
}

export function selectOrderLines(state: MockState, orderId: string): OrderLine[] {
  return state.orderLines.filter((l) => l.order_id === orderId)
}

export function selectOrdersForStore(state: MockState, storeId: string): Order[] {
  return state.orders.filter((o) => o.store_id === storeId)
}

export function selectDraftOrderForStore(
  state: MockState,
  storeId: string,
): Order | undefined {
  return state.orders.find((o) => o.store_id === storeId && o.status === 'draft')
}

export function selectWavesForDC(
  state: MockState,
  dcId: string,
  date?: string,
): Wave[] {
  return state.waves.filter(
    (w) => w.dc_id === dcId && (date ? w.dispatch_date === date : true),
  )
}

export function selectWaveById(state: MockState, id: string): Wave | undefined {
  return state.waves.find((w) => w.id === id)
}

export function selectOrdersForWave(state: MockState, waveId: string): Order[] {
  const wave = state.waves.find((w) => w.id === waveId)
  if (!wave) return []
  const set = new Set(wave.order_ids)
  return state.orders.filter((o) => set.has(o.id))
}

export function selectRouteForDriver(
  state: MockState,
  driverUserId: string,
  date?: string,
): { wave: Wave; orders: Order[] } | undefined {
  const wave = state.waves.find(
    (w) =>
      w.driver_user_id === driverUserId &&
      (date ? w.dispatch_date === date : w.status !== 'completed'),
  )
  if (!wave) return undefined
  return { wave, orders: selectOrdersForWave(state, wave.id) }
}

export function selectStoresForCluster(
  state: MockState,
  clusterId: string,
): Store[] {
  return state.stores.filter((s) => s.cluster_id === clusterId)
}

export function selectExceptionsForCluster(
  state: MockState,
  clusterId: string,
): Exception[] {
  const storeIds = new Set(
    state.stores.filter((s) => s.cluster_id === clusterId).map((s) => s.id),
  )
  const orderIds = new Set(
    state.orders.filter((o) => storeIds.has(o.store_id)).map((o) => o.id),
  )
  return state.exceptions.filter((e) => orderIds.has(e.order_id))
}

export function selectSkuById(state: MockState, id: string): SKU | undefined {
  return state.skus.find((s) => s.id === id)
}

export function selectInferredStockForStore(
  state: MockState,
  storeId: string,
): InferredStock[] {
  return state.inferredStock.filter((i) => i.store_id === storeId)
}

export function selectClustersForDC(state: MockState, dcId: string): string[] {
  const clusters = new Set(
    state.stores.filter((s) => s.home_dc_id === dcId).map((s) => s.cluster_id),
  )
  return Array.from(clusters).sort()
}

export function selectClientById(state: MockState, id: string): Client | undefined {
  return state.clients.find((c) => c.id === id)
}

export function selectSkusForClient(state: MockState, clientId: string): SKU[] {
  return state.skus.filter((s) => s.client_id === clientId)
}

export function selectPrimaryClientIdForOrder(
  state: MockState,
  orderId: string,
): string | undefined {
  const line = state.orderLines.find((l) => l.order_id === orderId)
  if (!line) return undefined
  return state.skus.find((s) => s.id === line.sku_id)?.client_id
}

export function selectOrdersForClient(state: MockState, clientId: string): Order[] {
  const clientSkuIds = new Set(
    state.skus.filter((s) => s.client_id === clientId).map((s) => s.id),
  )
  const orderIds = new Set(
    state.orderLines
      .filter((l) => clientSkuIds.has(l.sku_id))
      .map((l) => l.order_id),
  )
  return state.orders.filter((o) => orderIds.has(o.id))
}

export function selectInferredStockForClient(
  state: MockState,
  clientId: string,
): InferredStock[] {
  const clientSkuIds = new Set(
    state.skus.filter((s) => s.client_id === clientId).map((s) => s.id),
  )
  return state.inferredStock.filter((i) => clientSkuIds.has(i.sku_id))
}

export function selectSLAContractForClient(
  state: MockState,
  clientId: string,
): SLAContract | undefined {
  return state.slaContracts.find((c) => c.client_id === clientId)
}

export interface OrderSLA {
  clientId?: string
  contract?: SLAContract
  dueAt?: string
  status: SLAStatus
}

export function selectOrderSLA(state: MockState, orderId: string): OrderSLA {
  const order = state.orders.find((o) => o.id === orderId)
  if (!order) return { status: 'on_track' }

  const clientId = selectPrimaryClientIdForOrder(state, orderId)
  const contract = clientId ? selectSLAContractForClient(state, clientId) : undefined
  if (!contract) return { clientId, status: 'on_track' }

  const createdAt = new Date(order.created_at).getTime()
  const windowMs = contract.promised_delivery_hours * 60 * 60 * 1000
  const dueAtMs = createdAt + windowMs
  const dueAt = new Date(dueAtMs).toISOString()

  if (order.delivered_at) {
    const deliveredAtMs = new Date(order.delivered_at).getTime()
    return {
      clientId,
      contract,
      dueAt,
      status: deliveredAtMs <= dueAtMs ? 'on_track' : 'breached',
    }
  }

  const nowMs = getDemoNow().getTime()
  const remainingMs = dueAtMs - nowMs
  let status: SLAStatus
  if (remainingMs <= 0) {
    status = 'breached'
  } else if (remainingMs < windowMs * 0.25) {
    status = 'at_risk'
  } else {
    status = 'on_track'
  }
  return { clientId, contract, dueAt, status }
}

const SLA_URGENCY_RANK: Record<SLAStatus, number> = {
  breached: 0,
  at_risk: 1,
  on_track: 2,
}

export function selectOrdersBySLAUrgency(state: MockState, orders: Order[]): Order[] {
  return [...orders].sort((a, b) => {
    const slaA = selectOrderSLA(state, a.id)
    const slaB = selectOrderSLA(state, b.id)
    const rankDiff = SLA_URGENCY_RANK[slaA.status] - SLA_URGENCY_RANK[slaB.status]
    if (rankDiff !== 0) return rankDiff
    const dueA = slaA.dueAt ? new Date(slaA.dueAt).getTime() : Infinity
    const dueB = slaB.dueAt ? new Date(slaB.dueAt).getTime() : Infinity
    return dueA - dueB
  })
}

export function selectZonesForDC(state: MockState, dcId: string): WarehouseZone[] {
  return state.warehouseZones.filter((z) => z.dc_id === dcId)
}

export interface ZoneCapacity {
  zone: WarehouseZone
  client?: Client
  allocated: number
  used: number
  pct: number
}

export function selectCapacityForZone(
  state: MockState,
  zoneId: string,
): ZoneCapacity | undefined {
  const zone = state.warehouseZones.find((z) => z.id === zoneId)
  if (!zone) return undefined
  const allocation = state.capacityAllocations.find((c) => c.zone_id === zoneId)
  const allocated = allocation?.allocated_units ?? 0
  const used = allocation?.used_units ?? 0
  const pct = allocated > 0 ? Math.round((used / allocated) * 1000) / 10 : 0
  return {
    zone,
    client: state.clients.find((c) => c.id === zone.client_id),
    allocated,
    used,
    pct,
  }
}

export function selectCapacityAllocationsForDC(
  state: MockState,
  dcId: string,
): ZoneCapacity[] {
  return selectZonesForDC(state, dcId)
    .map((zone) => selectCapacityForZone(state, zone.id))
    .filter((x): x is ZoneCapacity => x !== undefined)
}

export function selectCapacityAlerts(state: MockState): ZoneCapacity[] {
  return state.warehouseZones
    .map((zone) => selectCapacityForZone(state, zone.id))
    .filter((x): x is ZoneCapacity => x !== undefined && x.pct >= 90)
}

export function selectKpiForPeriod(
  _state: MockState,
  period: 'today' | '7d' | '30d',
): {
  stockOutRatePct: number
  onTimePct: number
  acceptancePct: number
  avgCycleHours: number
} {
  const factor = period === 'today' ? 1 : period === '7d' ? 1.1 : 1.18
  const baseStockOut = 4.2
  const baseOnTime = 92.4
  const baseAcceptance = 78.5
  const baseCycle = 28.3
  return {
    stockOutRatePct: Math.round(baseStockOut * factor * 10) / 10,
    onTimePct: Math.round((baseOnTime / factor) * 10) / 10,
    acceptancePct: Math.round((baseAcceptance / factor) * 10) / 10,
    avgCycleHours: Math.round(baseCycle * factor * 10) / 10,
  }
}
