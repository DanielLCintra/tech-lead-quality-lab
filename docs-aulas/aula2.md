# 🧠 Aula 2 — Trocando `AnyObj` por tipo específico

## 🚧 Código original

```ts
const data: AnyObj[] = [];

export function createOrder(p: AnyObj) {
  const d: AnyObj = { ok: false, msg: "", order: null };
}

export function calculateShippingQuote(order: AnyObj) {
  const result: AnyObj = { success: false, message: "", totalFreight: 0 };
}

function calculateExtraByItems(items: any[]) {}
```

Problema:

- `AnyObj` no payload, retorno e lista em memória
- `any[]` no frete por itens

--------------------------------------------------

## ✅ Tipos novos (`orderService.ts`)

```ts
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
```

--------------------------------------------------

## 📍 Onde alterar (`orderService.ts`)

Linhas trocadas (versão já tipada):

```ts
const data: Order[] = [];

export function createOrder(p: CreateOrderPayload | null | undefined) {
  const d: CreateOrderResult = { ok: false, msg: "", order: null };
  // ... resto inalterado
}

export function calculateShippingQuote(order?: ShippingQuoteInput): ShippingQuoteResult {
  // ... resto inalterado
}

function calculateExtraByItems(items: ShippingQuoteItem[]): number {
  // ... resto inalterado
}

export function listOrders(): Order[] {
  // ... resto inalterado
}
```

--------------------------------------------------

## 🚀 Resultado

- `AnyObj` some do arquivo (payload, retorno, `data`)
- Frete com entrada/saída e itens tipados; sem `any[]` nos itens
