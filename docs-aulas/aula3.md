# 🧠 Aula 3 — Integrando SonarCloud no GitHub Actions (análise automática em PR)

## 🚧 Situação atual

Você já conectou seu projeto ao SonarCloud, mas ainda não integrou ao fluxo de desenvolvimento.

Problemas atuais:

- ❌ A análise não roda automaticamente  
- ❌ Pull Requests não são analisados  
- ❌ O time não recebe feedback no PR  
- ❌ O merge não é bloqueado por qualidade  

👉 Resultado: a ferramenta existe, mas não influencia o dia a dia do time.

--------------------------------------------------

## 🎯 Objetivo da aula

Ao final dessa aula você terá:

- ✅ Análise automática a cada push e PR  
- ✅ Feedback direto no Pull Request  
- ✅ Avaliação baseada em **New Code**  
- ✅ Bloqueio de merge com **Quality Gate**  

--------------------------------------------------

## 🧩 Visão geral do fluxo

1. Dev abre um PR  
2. GitHub Actions dispara o pipeline  
3. SonarCloud analisa o código  
4. Resultado aparece no PR  
5. Quality Gate decide se pode fazer merge  

--------------------------------------------------

## 🔐 Passo 1 — Gerar token no SonarCloud

1. Acesse o SonarCloud  
2. Vá em: **My Account → Security**  
3. Clique em **Generate Token**  
4. Dê um nome (ex: `github-actions`)  
5. Copie o token gerado  ba8b3849220cc2ba4cb82ce035e63137dc739c7b

--------------------------------------------------

## 🔒 Passo 2 — Criar secrets no GitHub

1. Acesse seu repositório no GitHub  
2. Vá em: **Settings → Secrets and variables → Actions**  
3. Clique em **New repository secret**

Crie os seguintes:

SONAR_TOKEN=seu_token_aqui  
SONAR_HOST_URL=https://sonarcloud.io (manter assim)

--------------------------------------------------

## ⚙️ Passo 3 — Criar o workflow do GitHub Actions

Crie o arquivo:

.github/workflows/sonar.yml

--------------------------------------------------

## 🧱 Passo 4 — Configurar o pipeline

Conteúdo do arquivo:

name: SonarCloud Analysis

on:
  push:
    branches:
      - main
      - develop
  pull_request:

jobs:
  sonar:
    name: SonarCloud Scan
    runs-on: ubuntu-latest

    steps:
      - name: Checkout do código
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Instalar dependências
        run: npm install

      - name: Rodar testes com cobertura
        run: npm run test -- --coverage

      - name: Rodar análise do SonarCloud
        uses: SonarSource/sonarcloud-github-action@v2
        with:
          args: >
            -Dsonar.organization=SEU_ORG
            -Dsonar.projectKey=tech-lead-quality-lab
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

          

--------------------------------------------------

## 🧠 Passo 5 — Configurar o sonar-project.properties

Crie o arquivo na raiz do projeto:

sonar-project.properties

Conteúdo:

sonar.projectKey=tech-lead-quality-lab  
sonar.organization=SEU_ORG  
sonar.sources=src  
sonar.tests=src  
sonar.javascript.lcov.reportPaths=coverage/lcov.info  

--------------------------------------------------

## 🔍 Passo 6 — Ativar análise de Pull Request

O gatilho já está configurado com:

on:
  pull_request:

--------------------------------------------------

## 🚦 Passo 7 — Adicionar Quality Gate no pipeline

Adicione esse step no final do workflow:

- name: Verificar Quality Gate
  uses: SonarSource/SonarCloud-quality-gate-action@v1
  timeout-minutes: 5
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

--------------------------------------------------

## 🔒 Passo 8 — Bloquear merge com base na qualidade

1. Vá em: **Settings → Branch protection rules**  
2. Escolha a branch (ex: `main`)  
3. Ative:

- Require status checks to pass  
- Require branches to be up to date before merging
- Escrevar Sonar e selecione: 
 - SonarCloud Code Analysis

--------------------------------------------------

## 🚀 Resultado final

- PR dispara análise automática  
- Apenas código novo é avaliado  
- Feedback aparece no PR  
- Merge é bloqueado se falhar  

--------------------------------------------------

## 🧠 Ponto mais importante

Cabe ao tech lead juntamente com o time decidir:

- Rating mínimo aceitável  
- % de cobertura de testes  
- Limite de duplicação  
- Tolerância a bugs e vulnerabilidades  

--------------------------------------------------

## 💡 Conclusão

Você saiu de:

❌ Análise manual  
❌ Sem visibilidade  
❌ Sem controle de qualidade  

Para:

✅ Análise automatizada  
✅ Feedback contínuo  
✅ Qualidade como critério de merge  

------------------------------------------------

## Extra: Código complexo e sem qualidade para testar o SonarCloud

export function listOrders(): any {
  let result: any = [];
  let total = 0;
  let flag = false;
  let orders = data;

  if (orders == null || orders == undefined || orders.length == 0) {
    console.log("No orders");
  } else {
    for (let i = 0; i < orders.length; i++) {
      let o = orders[i];

      if (o) {
        if (o.status == "NEW") {
          if (o.price != null && o.price != undefined) {
            total = total + o.price;
          } else {
            total = total + 0;
          }
        } else if (o.status == "NEW") { // duplicado proposital
          total = total + o.price;
        } else {
          if (o.status == "CANCELLED") {
            total = total - o.price;
          } else if (o.status == "CANCELLED") { // duplicado
            total = total - o.price;
          } else {
            total = total + 0;
          }
        }

        // lógica inútil
        if (true) {
          flag = true;
        } else {
          flag = false;
        }

        // variável nunca usada corretamente
        let temp = 123;
        temp = temp + 1;

        // duplicação grotesca
        if (o.customer && o.customer.name) {
          result.push({
            name: o.customer.name,
            value: o.price,
          });
        }

        if (o.customer && o.customer.name) {
          result.push({
            name: o.customer.name,
            value: o.price,
          });
        }

        // possível erro null
        if (o.items.length > 0) {
          for (let j = 0; j < o.items.length; j++) {
            let item = o.items[j];

            if (item.price > 0) {
              total += item.price;
            } else if (item.price <= 0) {
              total += 0;
            } else {
              total += 0;
            }
          }
        }

      } else {
        console.log("Order inválido");
      }
    }
  }

  // código morto
  if (false) {
    console.log("Nunca executa");
  }

  // retorno inconsistente
  if (flag == true) {
    return {
      success: true,
      total: total,
      data: result,
    };
  } else {
    return null;
  }
}