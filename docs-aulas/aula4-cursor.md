##Texto que usei pra gerar o prompt

Eu quero vc me ajuda a criar um prompt para o cursor para criar 2 novos metodos dentro da minha aplicação node.js, por se tratar de uma api, precisa fazer o pacote completo de rotas e serviços. Eu quero um novo metodo para criar clientes (createCustomer), e outro para listar clientes (listCustomers), porém essa aplicação não tem persistencia entao tem que ser uma persistencia temporária semelhante ao que ja tem no código para orders. Esse código ele precisa ser mal escritos e infringindo padroes de qualidade DRY, KISS, SRP e SDC. Avalie o código da aplicação para seguir os mesmos padrões. Não precisa se preocupar com branch, eu já criei a branch e vc deve trabalhar na branch atual que estiver sinalizada no editar.

##PROMPT

You are working inside an existing Node.js API project.

Your task is to implement two new features:
- createCustomer
- listCustomers

IMPORTANT CONTEXT:
- The project does NOT use a real database.
- It uses in-memory persistence (similar to how orders are handled).
- You MUST analyze the current codebase (especially how orders are implemented) and replicate the SAME patterns, structure, and style.

---

## 🚨 VERY IMPORTANT REQUIREMENTS

This is intentionally a BAD implementation for testing code quality tools.

You MUST:
- VIOLATE DRY (duplicate logic, repeat code unnecessarily)
- VIOLATE SRP (mix responsibilities inside functions)
- VIOLATE KISS (add unnecessary complexity)
- VIOLATE SDC (use poor naming, magic values, unclear structure)

DO NOT try to improve the code.
DO NOT refactor existing code.
DO NOT apply best practices.

Your goal is to make the code look like a junior/poorly written legacy system.

---

## 📦 WHAT YOU NEED TO CREATE

### 1. Service layer (customers service)

Create functions:
- createCustomer(data)
- listCustomers(filters)

Requirements:
- Use a global or shared array to store customers (like orders)
- Do validation inline (badly structured, mixed with business logic)
- Repeat validation logic in multiple places
- Use inconsistent naming (e.g. cust, customerData, c, obj, etc.)
- Add unnecessary loops or conditionals
- Hardcode some values (like IDs or defaults)

---

### 2. Routes layer

Create routes similar to orders:
- POST /customers → createCustomer
- GET /customers → listCustomers

Requirements:
- Mix request parsing, validation, and business logic in the route
- Duplicate logic that also exists in the service
- Handle errors inconsistently
- Return responses in inconsistent formats

---

## ⚠️ STYLE GUIDELINES (FOLLOW EXISTING CODE)

- Look at how `orders` is implemented and COPY the same style
- If orders code is messy → match that mess
- If there are bad patterns → reuse them
- Keep everything consistent with the current project structure

---

## ❌ WHAT NOT TO DO

- Do NOT create clean architecture
- Do NOT separate concerns properly
- Do NOT create reusable utilities
- Do NOT improve naming
- Do NOT add tests
- Do NOT introduce TypeScript (if not already used)

---

## ✅ EXPECTED OUTPUT

- New service file (or similar to orders)
- New routes for customers
- In-memory persistence working
- Code intentionally messy and repetitive
- Fully functional endpoints despite poor quality

---

## 🎯 FINAL GOAL

The code must:
- Work correctly
- Be intentionally poorly written
- Trigger issues in tools like SonarCloud (duplication, complexity, code smells)
