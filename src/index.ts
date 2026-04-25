import express from "express";
import swaggerUi from "swagger-ui-express";
import { createOrder, getShippingQuote, listOrders } from "./orderService";

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

app.post("/shipping/quote", (req, res) => {
  const serviceLevel = String(req.query.serviceLevel || "standard");
  const data = getShippingQuote(req.body);
  if (data.ok) {
    const multiplier = serviceLevel === "express" ? 1.35 : 1;
    const adjustedFreight = Number((data.freight * multiplier).toFixed(2));
    res.status(200).json({
      ...data,
      baseFreight: data.freight,
      freight: adjustedFreight,
      serviceLevel,
    });
  } else {
    res.status(400).json(data);
  }
});

const p = Number(process.env.PORT || 3000);
app.listen(p, () => {
  console.log("server on " + p);
});
