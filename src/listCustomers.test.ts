type CustomerServiceModule = typeof import("./customerService");

function buildPayload(index: number, overrides: Record<string, string> = {}) {
  return {
    name: `Customer ${index}`,
    email: `customer${index}@test.com`,
    cpf: `123456789${String(index).padStart(2, "0")}`,
    ...overrides,
  };
}

async function setupCustomers() {
  jest.resetModules();
  const customerService: CustomerServiceModule = await import("./customerService");

  customerService.createCustomer(buildPayload(1, { name: "Alice Silva", status: "ACTIVE", segment: "VIP" }));
  customerService.createCustomer(buildPayload(2, { name: "Bruno Costa", status: "INACTIVE", segment: "REGULAR" }));
  customerService.createCustomer(buildPayload(3, { name: "Carlos Souza", status: "ACTIVE", segment: "REGULAR" }));

  return customerService;
}

describe("listCustomers", () => {
  it("should return an empty array when there are no customers", async () => {
    jest.resetModules();
    const { listCustomers } = await import("./customerService");

    expect(listCustomers()).toEqual([]);
  });

  it("should return all customers when no filter is provided", async () => {
    const { listCustomers } = await setupCustomers();

    expect(listCustomers()).toHaveLength(3);
  });

  it("should filter by status", async () => {
    const { listCustomers } = await setupCustomers();

    const result = listCustomers({ status: "ACTIVE" });

    expect(result).toHaveLength(2);
    expect(result.every((customer) => customer.status === "ACTIVE")).toBe(true);
  });

  it("should filter by segment", async () => {
    const { listCustomers } = await setupCustomers();

    const result = listCustomers({ segment: "VIP" });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Alice Silva");
  });

  it("should filter by email ignoring case", async () => {
    const { listCustomers } = await setupCustomers();

    const result = listCustomers({ email: "CUSTOMER2@TEST.COM" });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Bruno Costa");
  });

  it("should filter by partial name ignoring case", async () => {
    const { listCustomers } = await setupCustomers();

    const result = listCustomers({ name: "sIlVa" });

    expect(result).toHaveLength(1);
    expect(result[0]?.email).toBe("customer1@test.com");
  });

  it("should combine multiple filters", async () => {
    const { listCustomers } = await setupCustomers();

    const result = listCustomers({ status: "ACTIVE", segment: "REGULAR", name: "carlos" });

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Carlos Souza");
  });

  it("should return empty array when filters do not match", async () => {
    const { listCustomers } = await setupCustomers();

    expect(listCustomers({ status: "BLOCKED" })).toEqual([]);
  });
});
