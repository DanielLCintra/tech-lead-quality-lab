import { createOrder, resetOrders } from "./orderService";

function validPayload(overrides = {}) {
  return {
    customer: { cpf: "12345678901", email: "test@test.com" },
    items: [{ qty: 1, stock: 10, price: 100 }],
    ...overrides,
  };
}

describe("createOrder", () => {
  beforeEach(() => {
    resetOrders();
  });

  describe("payload validation", () => {
    it("should reject null payload", () => {
      const result = createOrder(null as never);
      expect(result).toEqual({ ok: false, msg: "payload null", order: null });
    });

    it("should reject missing customer", () => {
      const result = createOrder({ items: [{ qty: 1, stock: 1 }] } as never);
      expect(result).toEqual({ ok: false, msg: "customer missing", order: null });
    });

    it("should reject missing cpf", () => {
      const result = createOrder({ customer: { email: "a@a.com" }, items: [{ qty: 1, stock: 1 }] } as never);
      expect(result).toEqual({ ok: false, msg: "cpf missing", order: null });
    });

    it("should reject missing email", () => {
      const result = createOrder({ customer: { cpf: "123" }, items: [{ qty: 1, stock: 1 }] } as never);
      expect(result).toEqual({ ok: false, msg: "email missing", order: null });
    });

    it("should reject empty items", () => {
      const result = createOrder(validPayload({ items: [] }));
      expect(result).toEqual({ ok: false, msg: "items invalid", order: null });
    });
  });

  describe("stock validation", () => {
    it("should reject when stock is less than quantity", () => {
      const result = createOrder(validPayload({ items: [{ qty: 5, stock: 2, price: 10 }] }));
      expect(result).toEqual({ ok: false, msg: "stock error", order: null });
    });

    it("should reject when qty is zero", () => {
      const result = createOrder(validPayload({ items: [{ qty: 0, stock: 10, price: 10 }] }));
      expect(result).toEqual({ ok: false, msg: "stock error", order: null });
    });
  });

  describe("order status determination", () => {
    it("should set APPROVED for PIX payment", () => {
      const result = createOrder(validPayload({ paymentType: "PIX" }));
      expect(result.order?.status).toBe("APPROVED");
    });

    it("should set APPROVED for CARD payment with subtotal <= 1000", () => {
      const result = createOrder(validPayload({ paymentType: "CARD", items: [{ qty: 1, stock: 10, price: 500 }] }));
      expect(result.order?.status).toBe("APPROVED");
    });

    it("should set MANUAL_REVIEW for CARD payment with subtotal > 1000", () => {
      const result = createOrder(validPayload({ paymentType: "CARD", items: [{ qty: 10, stock: 20, price: 200 }] }));
      expect(result.order?.status).toBe("MANUAL_REVIEW");
    });

    it("should set PENDING_PAYMENT for other payment types", () => {
      const result = createOrder(validPayload({ paymentType: "BOLETO" }));
      expect(result.order?.status).toBe("PENDING_PAYMENT");
    });

    it("should set PENDING_PAYMENT when no payment type", () => {
      const result = createOrder(validPayload());
      expect(result.order?.status).toBe("PENDING_PAYMENT");
    });
  });

  describe("discount calculation", () => {
    it("should apply 20% discount for subtotal > 500", () => {
      const result = createOrder(validPayload({ items: [{ qty: 10, stock: 20, price: 100 }] }));
      expect(result.order?.discount).toBe(200);
    });

    it("should apply 10% discount for subtotal > 300", () => {
      const result = createOrder(validPayload({ items: [{ qty: 4, stock: 10, price: 100 }] }));
      expect(result.order?.discount).toBe(40);
    });

    it("should apply 5% discount for subtotal > 100", () => {
      const result = createOrder(validPayload({ items: [{ qty: 2, stock: 10, price: 100 }] }));
      expect(result.order?.discount).toBe(10);
    });

    it("should apply no discount for subtotal <= 100", () => {
      const result = createOrder(validPayload({ items: [{ qty: 1, stock: 10, price: 50 }] }));
      expect(result.order?.discount).toBe(0);
    });

    it("should add coupon A value", () => {
      const result = createOrder(validPayload({ coupon: "A" }));
      expect(result.order?.discount).toBe(5);
    });

    it("should add coupon B value", () => {
      const result = createOrder(validPayload({ coupon: "B" }));
      expect(result.order?.discount).toBe(10);
    });

    it("should add coupon C value", () => {
      const result = createOrder(validPayload({ coupon: "C", items: [{ qty: 2, stock: 10, price: 100 }] }));
      expect(result.order?.discount).toBe(10 + 15);
    });
  });

  describe("freight calculation", () => {
    it("should charge 10 for zip starting with 1", () => {
      const result = createOrder(validPayload({ address: { zip: "10000000" } }));
      expect(result.order?.freight).toBe(10);
    });

    it("should charge 20 for zip starting with 2", () => {
      const result = createOrder(validPayload({ address: { zip: "20000000" } }));
      expect(result.order?.freight).toBe(20);
    });

    it("should charge 30 for zip starting with 3", () => {
      const result = createOrder(validPayload({ address: { zip: "30000000" } }));
      expect(result.order?.freight).toBe(30);
    });

    it("should charge 40 for other zips", () => {
      const result = createOrder(validPayload({ address: { zip: "50000000" } }));
      expect(result.order?.freight).toBe(40);
    });

    it("should charge 50 when no address", () => {
      const result = createOrder(validPayload());
      expect(result.order?.freight).toBe(50);
    });
  });

  describe("order creation", () => {
    it("should create order with correct total", () => {
      const result = createOrder(validPayload({ paymentType: "PIX", address: { zip: "10000000" } }));
      expect(result.ok).toBe(true);
      expect(result.order?.subtotal).toBe(100);
      expect(result.order?.freight).toBe(10);
      const discount = result.order?.discount ?? 0;
      expect(result.order?.total).toBe(100 - discount + 10);
    });

    it("should default currency to BRL", () => {
      const result = createOrder(validPayload());
      expect(result.order?.currency).toBe("BRL");
    });

    it("should use provided currency", () => {
      const result = createOrder(validPayload({ currency: "USD" }));
      expect(result.order?.currency).toBe("USD");
    });
  });
});
