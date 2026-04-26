import express from "express";
import swaggerUi from "swagger-ui-express";
import { createOrder, calculateShippingQuote, listOrders } from "./orderService";
import { createCustomer, listCustomers } from "./customerService";

const swaggerJSDoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    message: "Welcome to Critical Legacy Order Logistics API",
    docs: "/docs",
  });
});

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Critical Legacy Order Logistics API",
      version: "1.0.0",
      description: "Documentacao dos endpoints para testes e exploracao da API.",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: [],
});

swaggerSpec.paths = {
  "/": {
    get: {
      summary: "Rota de boas-vindas",
      responses: {
        "200": {
          description: "Mensagem de welcome",
        },
      },
    },
  },
  "/orders": {
    get: {
      summary: "Lista pedidos com filtros opcionais",
      parameters: [
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["NEW", "APPROVED", "MANUAL_REVIEW", "PENDING_PAYMENT"],
          },
          description: "Filtra pedidos por status",
        },
        {
          name: "customerCpf",
          in: "query",
          required: false,
          schema: {
            type: "string",
            example: "12345678901",
          },
          description: "Filtra pedidos por CPF do cliente",
        },
      ],
      responses: {
        "200": {
          description: "Pedidos retornados com sucesso",
        },
      },
    },
    post: {
      summary: "Cria um pedido",
      parameters: [
        {
          name: "x-sales-channel",
          in: "header",
          required: false,
          schema: {
            type: "string",
            enum: ["WEB", "MOBILE", "STORE"],
            default: "WEB",
          },
          description: "Canal de venda usado para rastreabilidade",
        },
        {
          name: "dryRun",
          in: "query",
          required: false,
          schema: {
            type: "boolean",
            default: false,
          },
          description: "Quando true, valida e calcula mas nao persiste o pedido",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["customer", "items"],
              properties: {
                customer: {
                  type: "object",
                  required: ["cpf", "email"],
                  properties: {
                    cpf: {
                      type: "string",
                      example: "12345678901",
                    },
                    email: {
                      type: "string",
                      example: "cliente@email.com",
                    },
                  },
                },
                items: {
                  type: "array",
                  minItems: 1,
                  items: {
                    type: "object",
                    required: ["qty", "stock", "price"],
                    properties: {
                      sku: { type: "string", example: "SKU-ABC-001" },
                      qty: { type: "number", example: 2 },
                      stock: { type: "number", example: 10 },
                      price: { type: "number", example: 99.9 },
                    },
                  },
                },
                address: {
                  type: "object",
                  properties: {
                    zip: { type: "string", example: "12345000" },
                  },
                },
                coupon: {
                  type: "string",
                  enum: ["A", "B", "C"],
                },
                paymentType: {
                  type: "string",
                  enum: ["PIX", "CARD", "BOLETO"],
                  example: "PIX",
                },
                currency: {
                  type: "string",
                  example: "BRL",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Pedido criado",
        },
        "400": {
          description: "Erro de validacao",
        },
      },
    },
  },
  "/shipping/quote": {
    post: {
      summary: "Calcula cotacao de frete",
      parameters: [
        {
          name: "serviceLevel",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["standard", "express"],
            default: "standard",
          },
          description: "Nivel de servico para simular cotacao",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["address"],
              properties: {
                address: {
                  type: "object",
                  required: ["zip"],
                  properties: {
                    zip: { type: "string", example: "29999999" },
                  },
                },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sku: { type: "string", example: "SKU-ABC-001" },
                      weight: { type: "number", example: 12.5 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Cotacao gerada",
        },
        "400": {
          description: "Erro de validacao",
        },
      },
    },
  },
  "/orders/{id}": {
    get: {
      summary: "Busca pedido por id",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
            example: "1",
          },
        },
      ],
      responses: {
        "200": {
          description: "Pedido encontrado",
        },
        "404": {
          description: "Pedido nao encontrado",
        },
      },
    },
  },
  "/customers": {
    get: {
      summary: "Lista clientes com filtros opcionais",
      parameters: [
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            type: "string",
            example: "ACTIVE",
          },
        },
        {
          name: "email",
          in: "query",
          required: false,
          schema: {
            type: "string",
            example: "john@email.com",
          },
        },
        {
          name: "segment",
          in: "query",
          required: false,
          schema: {
            type: "string",
            example: "VIP",
          },
        },
      ],
      responses: {
        "200": {
          description: "Clientes retornados com sucesso",
        },
      },
    },
    post: {
      summary: "Cria cliente",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["name", "email", "cpf"],
              properties: {
                name: {
                  type: "string",
                  example: "John Legacy",
                },
                email: {
                  type: "string",
                  example: "john@email.com",
                },
                cpf: {
                  type: "string",
                  example: "12345678901",
                },
                segment: {
                  type: "string",
                  example: "REGULAR",
                },
                status: {
                  type: "string",
                  example: "ACTIVE",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Cliente criado",
        },
        "400": {
          description: "Erro de validacao",
        },
      },
    },
  },
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.post("/orders", (req, res) => {
  const dryRun = String(req.query.dryRun || "false").toLowerCase() === "true";
  const channel = String(req.header("x-sales-channel") || "WEB");
  const data = createOrder(req.body);

  if (dryRun && data.ok) {
    return res.status(200).json({
      ...data,
      msg: "ok (dryRun)",
      metadata: {
        dryRun: true,
        channel,
      },
    });
  }

  if (data.ok) {
    res.status(201).json({
      ...data,
      metadata: {
        channel,
      },
    });
  } else {
    res.status(400).json(data);
  }
});

app.get("/orders", (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const customerCpf = req.query.customerCpf
    ? String(req.query.customerCpf)
    : undefined;

  let orders = listOrders();
  if (status) {
    orders = orders.filter((order) => order.status === status);
  }
  if (customerCpf) {
    orders = orders.filter((order) => order.customerCpf === customerCpf);
  }

  res.status(200).json({
    ok: true,
    filters: { status, customerCpf },
    count: orders.length,
    orders,
  });
});

app.get("/orders/:id", (req, res) => {
  const order = listOrders().find((item) => item.id === req.params.id);
  if (!order) {
    return res.status(404).json({
      ok: false,
      msg: "order not found",
    });
  }

  return res.status(200).json({
    ok: true,
    order,
  });
});

app.post("/customers", (req, res) => {
  const obj = req.body || {};
  const source = String(req.header("x-customer-source") || "WEB_FORM");

  if (!obj.name) {
    return res.status(400).json({ ok: false, msg: "name missing route" });
  }
  if (!obj.email) {
    return res.status(400).json({ ok: false, msg: "email missing route" });
  }
  if (!obj.cpf) {
    return res.status(400).json({ ok: false, msg: "cpf missing route" });
  }
  if (!String(obj.email).includes("@")) {
    return res.status(400).json({ msg: "email invalid route", ok: false });
  }
  if (String(obj.cpf).length < 11) {
    return res.status(400).json({ ok: false, msg: "cpf too short route" });
  }

  const r = createCustomer({
    ...obj,
    source,
  });

  if (r.ok) {
    return res.status(201).json({
      ok: true,
      msg: r.msg,
      data: r.customer,
      source: r.customer?.source,
    });
  }

  return res.status(400).json(r);
});

app.get("/customers", (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  const email = req.query.email ? String(req.query.email) : undefined;
  const segment = req.query.segment ? String(req.query.segment) : undefined;
  const name = req.query.name ? String(req.query.name) : undefined;

  let c = listCustomers();
  if (status) {
    c = c.filter((x) => x.status === status);
  }
  if (email) {
    c = c.filter((x) => String(x.email).toLowerCase() === String(email).toLowerCase());
  }
  if (segment) {
    c = c.filter((x) => x.segment === segment);
  }
  if (name) {
    c = c.filter((x) => String(x.name).toLowerCase().includes(String(name).toLowerCase()));
  }

  return res.status(200).json({
    ok: true,
    total: c.length,
    filters: { status, email, segment, name },
    customers: c,
  });
});

app.post("/shipping/quote", (req, res) => {
  const serviceLevel = String(req.query.serviceLevel || "standard");
  const data = calculateShippingQuote(req.body);
  if (data.success) {
    const multiplier = serviceLevel === "express" ? 1.35 : 1;
    const adjustedFreight = Number((data.totalFreight * multiplier).toFixed(2));
    res.status(200).json({
      ...data,
      baseFreight: data.totalFreight,
      freight: adjustedFreight,
      serviceLevel,
    });
  } else {
    res.status(400).json(data);
  }
});

export { app };

if (require.main === module) {
  const p = Number(process.env.PORT || 3000);
  app.listen(p, () => {
    console.log("server on " + p);
  });
}
