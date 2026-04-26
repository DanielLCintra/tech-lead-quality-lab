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
    it("should reject when name is missing", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer({ email: "a@b.com", cpf: "12345678901" });
      expect(result).toEqual({ ok: false, msg: "name missing", customer: null });
    });

    it("should reject when email is missing", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer({ name: "Test", cpf: "12345678901" });
      expect(result).toEqual({ ok: false, msg: "email missing", customer: null });
    });

    it("should reject when cpf is missing", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer({ name: "Test", email: "a@b.com" });
      expect(result).toEqual({ ok: false, msg: "cpf missing", customer: null });
    });

    it("should reject when email has no @", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer({ name: "Test", email: "invalid", cpf: "12345678901" });
      expect(result).toEqual({ ok: false, msg: "email invalid", customer: null });
    });

    it("should reject when cpf is too short", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer({ name: "Test", email: "a@b.com", cpf: "123" });
      expect(result).toEqual({ ok: false, msg: "cpf too short", customer: null });
    });
  });

  describe("successful creation", () => {
    it("should create a customer with valid payload", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload());

      expect(result.ok).toBe(true);
      expect(result.msg).toBe("ok");
      expect(result.customer).not.toBeNull();
      expect(result.customer?.name).toBe("Test User");
      expect(result.customer?.status).toBe("ACTIVE");
      expect(result.customer?.segment).toBe("REGULAR");
      expect(result.customer?.source).toBe("WEB_FORM");
    });

    it("should lowercase the email on creation", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload({ email: "USER@TEST.COM" }));

      expect(result.customer?.email).toBe("user@test.com");
    });

    it("should apply custom status and segment", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload({ status: "INACTIVE", segment: "VIP" }));

      expect(result.customer?.status).toBe("INACTIVE");
      expect(result.customer?.segment).toBe("VIP");
    });

    it("should preserve IMPORT source", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload({ source: "IMPORT" }));

      expect(result.customer?.source).toBe("IMPORT");
    });

    it("should preserve CRM source", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload({ source: "CRM" }));

      expect(result.customer?.source).toBe("CRM");
    });

    it("should default unknown sources to WEB_FORM", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload({ source: "UNKNOWN_CHANNEL" }));

      expect(result.customer?.source).toBe("WEB_FORM");
    });

    it("should assign sequential ids starting from 1000", async () => {
      const { createCustomer } = await freshModule();
      const r1 = createCustomer(validPayload({ email: "a@test.com", cpf: "11111111111" }));
      const r2 = createCustomer(validPayload({ email: "b@test.com", cpf: "22222222222" }));

      expect(r1.customer?.id).toBe("1000");
      expect(r2.customer?.id).toBe("1001");
    });

    it("should set createdAt as ISO string", async () => {
      const { createCustomer } = await freshModule();
      const result = createCustomer(validPayload());

      expect(result.customer?.createdAt).toBeDefined();
      expect(new Date(result.customer!.createdAt).toISOString()).toBe(result.customer?.createdAt);
    });
  });

  describe("duplicate checks", () => {
    it("should reject duplicate email", async () => {
      const { createCustomer } = await freshModule();
      createCustomer(validPayload({ email: "dup@test.com", cpf: "11111111111" }));
      const result = createCustomer(validPayload({ email: "dup@test.com", cpf: "22222222222" }));

      expect(result).toEqual({ ok: false, msg: "email already used", customer: null });
    });

    it("should reject duplicate email case-insensitively", async () => {
      const { createCustomer } = await freshModule();
      createCustomer(validPayload({ email: "user@test.com", cpf: "11111111111" }));
      const result = createCustomer(validPayload({ email: "USER@TEST.COM", cpf: "22222222222" }));

      expect(result).toEqual({ ok: false, msg: "email already used", customer: null });
    });

    it("should reject duplicate cpf", async () => {
      const { createCustomer } = await freshModule();
      createCustomer(validPayload({ email: "a@test.com", cpf: "11111111111" }));
      const result = createCustomer(validPayload({ email: "b@test.com", cpf: "11111111111" }));

      expect(result).toEqual({ ok: false, msg: "cpf already used", customer: null });
    });
  });
});
