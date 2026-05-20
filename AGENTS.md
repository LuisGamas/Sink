# Sink - Agent Instructions

## Project Overview

Sink is a link shortener with analytics, running 100% on Cloudflare (Workers, KV, D1, Analytics Engine, R2, AI). Built with Nuxt 4, shadcn-vue, Tailwind CSS 4, and TypeScript.

## Architecture

```
app/              → Main application (homepage, shared UI components)
layers/dashboard/ → Dashboard layer (SSR disabled, client-only)
server/           → Nitro server (API routes, middleware, database)
shared/           → Shared schemas (Zod) and TypeScript types
i18n/             → 10 locales, fallback to en-US
```

### Key Patterns

- **UI Components**: shadcn-vue (New York style, zinc base) in `app/components/ui/`. Added via CLI: `npx shadcn-vue@latest add <component>`.
- **Forms**: `@tanstack/vue-form` for complex forms, Zod for validation.
- **Data Tables**: `@tanstack/vue-table` for tabular data.
- **State**: Pinia stores + Vue composables in `composables/`.
- **Database**: D1 (SQL via sql-bricks) for management, KV for fast-path redirects.
- **API Auth**: Bearer token via `NUXT_SITE_TOKEN` header.
- **Styling**: Tailwind CSS 4 with CSS variables for theming. Dark mode via `@nuxtjs/color-mode`.

### Layer Structure

The dashboard is a Nuxt layer (`layers/dashboard/`) with:
- Client-only rendering (no SSR)
- Auth middleware (`auth.global.ts`)
- Feature composables: `links.ts`, `analysis.ts`, `realtime.ts`, `metadata.ts`
- WebGL 3D globe for real-time analytics visualization

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev server on port 7465
pnpm build            # Production build
pnpm test             # Vitest with Cloudflare Workers pool
pnpm lint             # ESLint
pnpm types:check      # TypeScript checking
```

### Database Migrations

```bash
npx wrangler d1 migrations apply sink-db --remote
```

### Deployment

Target: Cloudflare Workers (recommended) or Cloudflare Pages. See `docs/deployment/` for guides.

## Conventions

- Vue 3 Composition API with `<script setup lang="ts">`
- Auto-imports enabled (Nuxt composables, Vue reactivity, components)
- Component naming: PascalCase files, auto-registered by Nuxt
- API routes: `server/api/<resource>/<action>.<method>.ts`
- Schemas in `shared/schemas/` validated with Zod
- Icons: `lucide-vue-next`
- Toast notifications: `vue-sonner`
- Responsive modals: Dialog on desktop, Drawer on mobile (`ResponsiveModal.vue`)

## Testing

Tests use `@cloudflare/vitest-pool-workers` to run in a Workers-like environment with miniflare bindings. Test files are in `tests/`.

## Configuration

Environment variables documented in `docs/configuration.md` and `.env.example`. Key vars:
- `NUXT_SITE_TOKEN` - Dashboard access token (min 8 chars, not pure numbers)
- `NUXT_CF_ACCOUNT_ID` / `NUXT_CF_API_TOKEN` - Cloudflare API access
- `NUXT_DATASET` - Analytics Engine dataset name
