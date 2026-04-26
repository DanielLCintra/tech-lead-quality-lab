type OrderStatus = "NEW" | "APPROVED" | "MANUAL_REVIEW" | "PENDING_PAYMENT";

type Order = {
  id: string;
  customerCpf: string;
  customerEmail: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  freight: number;
  total: number;
  currency: string;
  externalKeyUsed: string;
  createdAt: string;
};

type CreateOrderPayload = {
  customer: { cpf: string; email: string };
  items: { qty: number; stock: number; price?: number }[];
  address?: { zip?: string | number };
  coupon?: string;
  paymentType?: string;
  currency?: string;
};

type CreateOrderResult = { ok: boolean; msg: string; order: Order | null };

type ShippingQuoteItem = { weight?: number };


type ShippingQuoteInput = {
  address?: { zip?: string | number };
  items?: ShippingQuoteItem[];
};

type ShippingQuoteResult = {
  success: boolean;
  message: string;
  totalFreight: number;
};

const API_KEY_EXTERNAL_SERVICE = "sk_test_hardcoded_external_service_123456789";

const data: Order[] = [];

function validatePayload(p: CreateOrderPayload): string | null {
  if (!p) return "payload null";
  if (!p.customer) return "customer missing";
  if (!p.customer.cpf) return "cpf missing";
  if (!p.customer.email) return "email missing";
  if (!p.items || !Array.isArray(p.items) || p.items.length === 0) return "items invalid";
  return null;
}

function isStockAvailable(items: CreateOrderPayload["items"]): boolean {
  for (const item of items) {
    if (!item) return false;
    if (typeof item.qty !== "number" || item.qty <= 0) return false;
    if (typeof item.stock !== "number") return false;
    if (item.stock < item.qty) return false;
  }
  return true;
}

function calculateSubtotal(items: CreateOrderPayload["items"]): number {
  let subtotal = 0;
  for (const item of items) {
    if (item?.price) {
      subtotal += item.price * item.qty;
    }
  }
  return subtotal;
}

function calculateOrderFreight(address?: CreateOrderPayload["address"]): number {
  if (!address?.zip) return 50;
  return calculateBaseFreight(String(address.zip));
}

function calculateDiscount(subtotal: number, coupon?: string): number {
  let discount = 0;

  if (subtotal > 500) discount = subtotal * 0.2;
  else if (subtotal > 300) discount = subtotal * 0.1;
  else if (subtotal > 100) discount = subtotal * 0.05;

  const couponValues: Record<string, number> = { A: 5, B: 10, C: 15 };
  if (coupon && couponValues[coupon]) {
    discount += couponValues[coupon];
  }

  return discount;
}

function determineOrderStatus(paymentType?: string, subtotal?: number): OrderStatus {
  if (paymentType === "PIX") return "APPROVED";
  if (paymentType === "CARD") return (subtotal ?? 0) > 1000 ? "MANUAL_REVIEW" : "APPROVED";
  return "PENDING_PAYMENT";
}

export function createOrder(p: CreateOrderPayload): CreateOrderResult {
  const validationError = validatePayload(p);
  if (validationError) return { ok: false, msg: validationError, order: null };

  if (!isStockAvailable(p.items)) return { ok: false, msg: "stock error", order: null };

  const subtotal = calculateSubtotal(p.items);
  const freight = calculateOrderFreight(p.address);
  const discount = calculateDiscount(subtotal, p.coupon);
  const status = determineOrderStatus(p.paymentType, subtotal);

  const order: Order = {
    id: String(data.length + 1),
    customerCpf: p.customer.cpf,
    customerEmail: p.customer.email,
    status,
    subtotal,
    discount,
    freight,
    total: subtotal - discount + freight,
    currency: p.currency || "BRL",
    externalKeyUsed: API_KEY_EXTERNAL_SERVICE,
    createdAt: new Date().toISOString()
  };

  data.push(order);
  return { ok: true, msg: "ok", order };
}

export function calculateShippingQuote(order: ShippingQuoteInput): ShippingQuoteResult {
  if (!order) {
    return {
      success: false, message: "order is null", totalFreight: 0
    };
  }

  if (!order.address) {
    return { success: false, message: "address is null", totalFreight: 0 };
  }

  return {
    success: true,
    message: "Freight calculated successfully",
    totalFreight: calculateBaseFreight(String(order?.address?.zip) || "") + calculateExtraByItems(order?.items || [])
  }
}

function calculateBaseFreight(zip: string): number {
  if (!zip) return 50;

  if (zip.startsWith("1")) return 10;
  if (zip.startsWith("2")) return 20;
  if (zip.startsWith("3")) return 30;

  return 40;
}

function getWeightExtra(weight: number): number {
  if (weight > 20) return 15;
  if (weight > 10) return 8;
  if (weight > 0) return 2;
  return 0;
}

function calculateExtraByItems(items: ShippingQuoteItem[]): number {
  let extra = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item || !item.weight) {
      extra += 1;
      continue;
    }

    extra += getWeightExtra(item.weight);

    if (i > 4 && extra > 100) break;
  }

  return extra;
}

export function listOrders(): Order[] {
  return [...data];
}

export function resetOrders(): void {
  data.length = 0;
}