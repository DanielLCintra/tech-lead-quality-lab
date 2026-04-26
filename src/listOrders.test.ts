import { listOrders, createOrder, resetOrders } from "./orderService";

function createValidOrderPayload(overrides = {}) {
  return {
    customer: { cpf: "12345678901", email: "test@test.com" },
    items: [{ qty: 1, stock: 10, price: 100 }],
    paymentType: "PIX",
    ...overrides,
  };
}

describe("listOrders", () => {
  beforeEach(() => {
    resetOrders();
  });

  it("should return an empty array when no orders exist", () => {
    const result = listOrders();

    expect(result).toEqual([]);
  });

  it("should return all created orders", () => {
    createOrder(createValidOrderPayload());
    createOrder(
      createValidOrderPayload({
        customer: { cpf: "99988877766", email: "other@test.com" },
      })
    );

    const result = listOrders();

    expect(result).toHaveLength(2);
    expect(result[0].customerCpf).toBe("12345678901");
    expect(result[1].customerCpf).toBe("99988877766");
  });

  it("should return orders with correct properties", () => {
    createOrder(
      createValidOrderPayload({
        currency: "USD",
        address: { zip: "20000000" },
        coupon: "B",
      })
    );

    const [order] = listOrders();

    expect(order).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        customerCpf: "12345678901",
        customerEmail: "test@test.com",
        status: "APPROVED",
        subtotal: expect.any(Number),
        discount: expect.any(Number),
        freight: expect.any(Number),
        total: expect.any(Number),
        currency: "USD",
        createdAt: expect.any(String),
      })
    );
  });

  it("should return a defensive copy that does not affect internal data", () => {
    createOrder(createValidOrderPayload());

    const firstCall = listOrders();
    firstCall.pop();

    const secondCall = listOrders();

    expect(secondCall).toHaveLength(1);
  });

  it("should return an empty array after orders are reset", () => {
    createOrder(createValidOrderPayload());
    expect(listOrders()).toHaveLength(1);

    resetOrders();

    expect(listOrders()).toEqual([]);
  });

  it("should preserve order insertion sequence", () => {
    createOrder(
      createValidOrderPayload({
        customer: { cpf: "111", email: "a@a.com" },
      })
    );
    createOrder(
      createValidOrderPayload({
        customer: { cpf: "222", email: "b@b.com" },
      })
    );
    createOrder(
      createValidOrderPayload({
        customer: { cpf: "333", email: "c@c.com" },
      })
    );

    const result = listOrders();

    expect(result.map((o) => o.customerCpf)).toEqual(["111", "222", "333"]);
  });
});
