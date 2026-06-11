import type { Client, SKUCategory } from '../types'

export const clients: Client[] = [
  {
    id: 'client-renyah',
    name: 'Renyah Group',
    code: 'RYG',
    category: 'snacks',
    contact_name: 'Pak Yanto',
    contact_email: 'yanto@renyahgroup.co.id',
  },
  {
    id: 'client-segar',
    name: 'Segar Beverages',
    code: 'SGB',
    category: 'beverages',
    contact_name: 'Bu Wulan',
    contact_email: 'wulan@segarbeverages.co.id',
  },
  {
    id: 'client-bersih',
    name: 'Bersih Personal Care',
    code: 'BPC',
    category: 'toiletries',
    contact_name: 'Pak Joko',
    contact_email: 'joko@bersihpersonalcare.co.id',
  },
]

export const CATEGORY_TO_CLIENT: Record<SKUCategory, string> = {
  snacks: 'client-renyah',
  beverages: 'client-segar',
  toiletries: 'client-bersih',
}
