# 🚧 Código original (problema)

- Nomes genéricos  
- Lógica misturada  
- Repetição  
- Muitos if/else aninhados  

Resultado: difícil de ler e manter

--------------------------------------------------

# 🧠 Passo 1 — SDC (Código autoexplicativo)

Melhorando nomes

export function calculateShippingQuote(order: AnyObj) {
  const result: AnyObj = { success: false, message: "", totalFreight: 0 };

  if (!order) {
    result.message = "order is null";
    return result;
  }

  if (!order.address) {
    result.message = "address is null";
    return result;
  }
}

O que mudou:
- p → order
- d → result
- ok → success
- msg → message
- freight → totalFreight

Código começa a se explicar sozinho

--------------------------------------------------

# ✂️ Passo 2 — SRP (Single Responsibility)

Separando responsabilidades

function calculateBaseFreight(zip: string): number {
  if (!zip) return 50;

  if (zip.startsWith("1")) return 10;
  if (zip.startsWith("2")) return 20;
  if (zip.startsWith("3")) return 30;

  return 40;
}

function calculateExtraByItems(items: any[]): number {
  let extra = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item || !item.weight) {
      extra += 1;
      continue;
    }

    if (item.weight > 20) extra += 15;
    else if (item.weight > 10) extra += 8;
    else if (item.weight > 0) extra += 2;

    if (i > 4 && extra > 100) break;
  }

  return extra;
}

O que mudou:
- Cada função tem uma responsabilidade
- Mais fácil testar
- Código desacoplado

--------------------------------------------------

# 🔁 Passo 3 — DRY (Don't Repeat Yourself)

Removendo duplicação

function getWeightExtra(weight: number): number {
  if (weight > 20) return 15;
  if (weight > 10) return 8;
  if (weight > 0) return 2;
  return 0;
}

function calculateExtraByItems(items: any[]): number {
  let extra = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item || !item.weight) {
      extra += 1;
      continue;
    }

    extra += getWeightExtra(item.weight);

    if (i > 4 && extra > 100) break;
  }

  return extra;
}

O que mudou:
- Regra de cálculo centralizada
- Evita inconsistência
- Facilita manutenção

--------------------------------------------------

# ⚡ Passo 4 — KISS (Keep It Simple)

Simplificando fluxo

export function calculateShippingQuote(order: AnyObj) {
  if (!order) {
    return { success: false, message: "order is null", totalFreight: 0 };
  }

  if (!order.address) {
    return { success: false, message: "address is null", totalFreight: 0 };
  }

  return {
    success: true,
    message: "Freight calculated successfully",
    totalFreight:
      calculateBaseFreight(String(order.address.zip || "")) +
      calculateExtraByItems(order.items || []),
  };
}

--------------------------------------------------

# 🚀 Resultado final

Antes:
- Difícil de entender  
- Muitas responsabilidades misturadas  
- Código repetitivo  

Depois:
- Código legível  
- Responsabilidades claras  
- Fácil de manter e evoluir  

--------------------------------------------------

# 💡 Mensagem final

Código limpo não é reescrever tudo — é melhorar decisões.