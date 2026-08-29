# Ideias: conteúdo e artigos para engajamento e SEO

Backlog de ideias discutidas em 2026-08-23, motivadas pelo status "Detectada, mas não
indexada no momento" no Google Search Console (13 páginas, site com menos de 1 mês).
Conteúdo fresco e único ajuda tanto o usuário quanto a velocidade de indexação/confiança
do domínio no Google. Nada aqui foi implementado ainda — é só o catálogo de opções.

## 1. Seção de artigos/blog

Conteúdo de cauda longa (ex: "Como limpar seus cristais", "Pedras para cada signo",
"Ametista vs. quartzo: diferenças") para atrair busca orgânica e dar motivo de retorno
ao site. Hoje não existe CMS de conteúdo — só Firestore para minerais/categorias.

Duas opções de implementação:

- **`@nuxt/content`**: artigos em markdown versionados no repo. Mais simples de montar,
  mas sem UI de administração (edição via PR/commit).
- **Collection `articles` no Firestore**: segue o mesmo padrão CRUD já usado para
  minerais/categorias no admin (`useMineralsStore`, `useCategoriesStore` como
  referência de shape). Permite reaproveitar os endpoints Groq existentes
  (`server/api/structure-mineral.post.ts`, `server/api/improve-mineral.post.ts`) como
  base para um assistente de redação de artigos no admin.

## 2. Enriquecer as páginas de mineral existentes

Hoje cada mineral (`app/pages/minerais/[slug]/index.vue`) tem só descrição curta +
propriedades mágicas. Possíveis seções novas por mineral:

- Como usar (meditação, ambientes, rituais)
- Combinações com outras pedras
- Curiosidades / história

Isso reduz o efeito de "página template rasa" aos olhos do Google e torna cada página
mais interessante para o leitor, sem precisar de uma seção nova no site.

## Próximos passos (quando retomar)

- Decidir entre `@nuxt/content` vs. collection Firestore para artigos.
- Definir os primeiros 3-5 títulos de artigo para validar o formato.
- Se for Firestore: desenhar o schema de `articles` e a página de listagem/detalhe
  (`/artigos`, `/artigos/[slug]`), seguindo o padrão de SEO já usado em
  `app/composables/useSeo.ts`.
