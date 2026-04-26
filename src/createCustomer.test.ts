type CreateCustomerServiceModule = typeof import("./customerService");

function validPayload(overrides: Record<string, string> = {}) {
  return {
    name: "Test User",
    email: `user${Date.now()}@test.com`,
    cpf: "12345678901",
    ...overrides,
  };
}

async function freshModule(): Promise<CreateCustomerServiceModule> {
  jest.resetModules();
  return import("./customerService");
}

describe("createCustomer", () => {
  describe("validation", () => {
    it.each([
      [{ email: "a@b.com", cpf: "12345678901" }, "name missing"],
      [{ name: "Test", cpf: "12345678901" }, "email missing"],
      [{ name: "Test", email: "a@b.com" }, "cpf missing"],
      [{ name: "Test", email: "invalid", cpf: "12345678901" }, "email invalid"],
      [{ name: "Test", email: "a@b.com", cpf: "123" }, "cpf too short"],
    ])("should reject with '%s' → %s", async (payload, expectedMsg) => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(payload);
      expect(result).toEqual({ ok: false, msg: expectedMsg, customer: null });
    });
  });

  describe("successful creation", () => {
    it("should create a customer with defaults and lowercase email", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload({ email: "USER@TEST.COM" }));

      expect(result.ok).toBe(true);
      expect(result.msg).toBe("ok");
      expect(result.customer).toMatchObject({
        name: "Test User",
        email: "user@test.com",
        status: "ACTIVE",
        segment: "REGULAR",
        source: "WEB_FORM",
      });
      expect(result.customer?.createdAt).toBeDefined();
      expect(new Date(result.customer!.createdAt).toISOString()).toBe(result.customer?.createdAt);
    });

    it("should apply custom status and segment", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload({ status: "INACTIVE", segment: "VIP" }));

      expect(result.customer?.status).toBe("INACTIVE");
      expect(result.customer?.segment).toBe("VIP");
    });

    it.each([
      ["IMPORT", "IMPORT"],
      ["CRM", "CRM"],
      ["UNKNOWN_CHANNEL", "WEB_FORM"],
      ["STORE", "WEB_FORM"],
    ])("should map source '%s' to '%s'", async (input, expected) => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload({ source: input }));
      expect(result.customer?.source).toBe(expected);
    });

    it("should assign sequential ids starting from 1000", async () => {
      const { createCustomer } = await freshModule();
      const r1 = createCustomer(validPayload({ email: "a@test.com", cpf: "11111111111" }));
      const r2 = createCustomer(validPayload({ email: "b@test.com", cpf: "22222222222" }));

      expect(r1.customer?.id).toBe("1000");
      expect(r2.customer?.id).toBe("1001");
    });
  });

  describe("duplicate checks", () => {
    it.each([
      {
        desc: "exact email",
        first: { email: "dup@test.com", cpf: "11111111111" },
        second: { email: "dup@test.com", cpf: "22222222222" },
        expectedMsg: "email already used",
      },
      {
        desc: "email case-insensitively",
        first: { email: "user@test.com", cpf: "11111111111" },
        second: { email: "USER@TEST.COM", cpf: "22222222222" },
        expectedMsg: "email already used",
      },
      {
        desc: "cpf",
        first: { email: "a@test.com", cpf: "11111111111" },
        second: { email: "b@test.com", cpf: "11111111111" },
        expectedMsg: "cpf already used",
      },
    ])("should reject duplicate $desc", async ({ first, second, expectedMsg }) => {
      const { createCustomer } = await freshModule();
      createCustomer(validPayload(first));
      const result = createCustomer(validPayload(second));
      expect(result).toEqual({ ok: false, msg: expectedMsg, customer: null });
    });
  });
});
