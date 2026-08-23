export interface Order {
  id?: number;
  petId?: number;
  quantity?: number;
  shipDate?: string;
  status?: 'placed' | 'approved' | 'delivered' | string;
  complete?: boolean;
}

export interface InventoryMap {
  [status: string]: number;
}
