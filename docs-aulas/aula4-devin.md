#Texto que eu usei pra gerar o prompt

Eu quero ajuda pra escrever um prompt para o devin, para que ele faça uma melhoria de código no meu projeto. Eu ainda nao tenho uma branch especifica para isso, eu quero que a partir da branch feature/aula-3-pipeline-sonar, ele crie uma branch com nome feature/aula-4-ai-devin-cursor e faça as modificações sempre nessa branch. Eu quero vc aja como desenvolvedor e avalie a função listOrders e aplique os conceitos de DRY, SRP, KISS, SDC (Self Documented Code). Depois disso eu quero que vc implemente testes unitários para essa função. Esses testes podem ser simples mas devem garantir cobertura de 100% do código da função.

#PROMPT
You are acting as a senior software engineer focused on clean code, maintainability, and testability.

## 🌿 Branch strategy

1. Checkout from the existing branch:
   feature/aula-3-pipeline-sonar

2. Create a new branch:
   feature/aula-4-ai-devin-cursor

3. All changes must be made strictly within this new branch.

---

## 🎯 Objective

Improve the existing function `listOrders` by applying the following software engineering principles:

- DRY (Don't Repeat Yourself)
- SRP (Single Responsibility Principle)
- KISS (Keep It Simple, Stupid)
- SDC (Self-Documented Code)

---

## 🔍 What you need to do

1. Analyze the current implementation of `listOrders`
2. Identify code smells such as:
   - Duplication
   - Poor naming
   - Multiple responsibilities
   - Unnecessary complexity
3. Refactor the function to:
   - Improve readability
   - Reduce complexity
   - Make it self-explanatory
   - Break responsibilities into smaller functions if needed

---

## 🧪 Unit Tests

After refactoring:

1. Create unit tests for `listOrders`
2. Tests must:
   - Be simple and clear
   - Cover 100% of the function's code paths
   - Validate expected behavior (happy path + edge cases)
3. Use best practices:
   - Arrange, Act, Assert pattern
   - Meaningful test names
   - Isolated tests (no external dependencies unless mocked)

---

## 📦 Deliverables

- Refactored `listOrders` function
- Any helper functions created (if needed)
- Unit test file with full coverage
- Ensure code passes lint and static analysis (Sonar-friendly)

---

## ⚠️ Constraints

- Do not change business logic unless necessary to fix issues
- Do not introduce unnecessary abstractions
- Prefer clarity over cleverness
- Keep the solution simple and maintainable

---

## ✅ Expected Outcome

Cleaner, more maintainable code with:
- Reduced complexity
- Clear responsibilities
- High readability
- Full test coverage