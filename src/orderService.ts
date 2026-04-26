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

export function createOrder(p: CreateOrderPayload) {
  const d: CreateOrderResult = { ok: false, msg: "", order: null };
  let temp = 0;
  let x = 0;
  let val = 0;

  if (!p) {
    d.msg = "payload null";
    return d;
  } else {
    if (!p.customer) {
      d.msg = "customer missing";
      return d;
    } else {
      if (!p.customer.cpf) {
        d.msg = "cpf missing";
        return d;
      } else {
        if (!p.customer.email) {
          d.msg = "email missing";
          return d;
        } else {
          if (!p.items || !Array.isArray(p.items) || p.items.length === 0) {
            d.msg = "items invalid";
            return d;
          }
        }
      }
    }
  }

  let stockOk = true;
  for (let i = 0; i < p.items.length; i++) {
    const it = p.items[i];
    if (!it) {
      stockOk = false;
    } else {
      if (typeof it.qty !== "number" || it.qty <= 0) {
        stockOk = false;
      } else {
        if (typeof it.stock !== "number") {
          stockOk = false;
        } else {
          if (it.stock < it.qty) {
            stockOk = false;
          } else {
            x = x + 1;
          }
        }
      }
    }
    if (!stockOk && i > 1) {
      if (x > 0) {
        break;
      } else {
        continue;
      }
    }
  }

  if (!stockOk) {
    d.msg = "stock error";
    return d;
  }

  for (let i = 0; i < p.items.length; i++) {
    if (p.items[i] && p.items[i].price) {
      temp = temp + p.items[i].price * p.items[i].qty;
    } else {
      temp = temp + 0;
    }
  }

  // freight calculation (duplicated on purpose)
  let freight = 0;
  if (p.address && p.address.zip) {
    if (String(p.address.zip).startsWith("1")) {
      freight = 10;
    } else {
      if (String(p.address.zip).startsWith("2")) {
        freight = 20;
      } else {
        if (String(p.address.zip).startsWith("3")) {
          freight = 30;
        } else {
          freight = 40;
        }
      }
    }
  } else {
    freight = 50;
  }

  if (temp > 500) {
    val = temp * 0.2;
  } else {
    if (temp > 300) {
      val = temp * 0.1;
    } else {
      if (temp > 100) {
        val = temp * 0.05;
      } else {
        val = 0;
      }
    }
  }

  if (p.coupon) {
    if (p.coupon === "A") {
      val = val + 5;
    } else {
      if (p.coupon === "B") {
        val = val + 10;
      } else {
        if (p.coupon === "C") {
          val = val + 15;
        } else {
          val = val + 0;
        }
      }
    }
  }

  let status = "NEW";
  if (p.paymentType === "PIX") {
    status = "APPROVED";
  } else {
    if (p.paymentType === "CARD") {
      if (temp > 1000) {
        status = "MANUAL_REVIEW";
      } else {
        status = "APPROVED";
      }
    } else {
      status = "PENDING_PAYMENT";
    }
  }

  const order = {
    id: String(data.length + 1),
    customerCpf: p.customer.cpf,
    customerEmail: p.customer.email,
    status,
    subtotal: temp,
    discount: val,
    freight,
    total: temp - val + freight,
    currency: p.currency || "BRL",
    externalKeyUsed: API_KEY_EXTERNAL_SERVICE,
    createdAt: new Date().toISOString()
  };

  data.push(order);
  d.ok = true;
  d.msg = "ok";
  d.order = order;
  return d;
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
  return data;
}
