import request from "supertest";
import type { Express } from "express";

let app: Express;

beforeAll(async () => {
  jest.resetModules();
  const mod = await import("./index");
  app = mod.app;
});

describe("POST /customers", () => {
  it("should return 400 when name is missing", async () => {
    const res = await request(app)
      .post("/customers")
      .send({ email: "a@b.com", cpf: "12345678901" });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.msg).toBe("name missing route");
  });

  it("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/customers")
      .send({ name: "Test", cpf: "12345678901" });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("email missing route");
  });

  it("should return 400 when cpf is missing", async () => {
    const res = await request(app)
      .post("/customers")
      .send({ name: "Test", email: "a@b.com" });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("cpf missing route");
  });

  it("should return 400 when email is invalid", async () => {
    const res = await request(app)
      .post("/customers")
      .send({ name: "Test", email: "nope", cpf: "12345678901" });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("email invalid route");
  });

  it("should return 400 when cpf is too short", async () => {
    const res = await request(app)
      .post("/customers")
      .send({ name: "Test", email: "a@b.com", cpf: "123" });

    expect(res.status).toBe(400);
    expect(res.body.msg).toBe("cpf too short route");
  });

  it("should return 201 on valid creation", async () => {
    const res = await request(app)
      .post("/customers")
      .send({ name: "Route User", email: "route@test.com", cpf: "99988877766" });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.name).toBe("Route User");
    expect(res.body.source).toBe(res.body.data.source);
  });

  it("should use x-customer-source header", async () => {
    const res = await request(app)
      .post("/customers")
      .set("x-customer-source", "CRM")
      .send({ name: "CRM User", email: "crm@test.com", cpf: "11122233344" });

    expect(res.status).toBe(201);
    expect(res.body.data.source).toBe("CRM");
  });

  it("should return 400 on duplicate email via service", async () => {
    const res = await request(app)
      .post("/customers")
      .send({ name: "Dup User", email: "route@test.com", cpf: "55544433322" });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.msg).toBe("email already used");
  });
});

describe("GET /customers", () => {
  it("should return all customers without filters", async () => {
    const res = await request(app).get("/customers");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.customers)).toBe(true);
  });

  it("should filter by email", async () => {
    const res = await request(app).get("/customers?email=route@test.com");

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.filters.email).toBe("route@test.com");
  });

  it("should filter by name partial match", async () => {
    const res = await request(app).get("/customers?name=Route");

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it("should filter by status", async () => {
    const res = await request(app).get("/customers?status=ACTIVE");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.filters.status).toBe("ACTIVE");
  });

  it("should filter by segment", async () => {
    const res = await request(app).get("/customers?segment=REGULAR");

    expect(res.status).toBe(200);
    expect(res.body.filters.segment).toBe("REGULAR");
  });
});
