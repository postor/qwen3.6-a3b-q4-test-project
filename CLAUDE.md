# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 app with React 19, Tailwind CSS 4, TypeScript. Core feature: Todo app with localStorage persistence and full TDD test coverage using vitest + testing-library.

## Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build
npm start            # Run production build
npm run lint         # ESLint check

# Testing (always use npm, never edit package.json manually)
npx vitest run       # Run all tests once
npx vitest run src/lib/todo.test.ts   # Single test file
npx vitest run --reporter=verbose     # Verbose output for debugging failures

# Dependencies (never hand-edit package.json)
npm install <pkg>           # Add production dependency
npm install -D <pkg>        # Add dev dependency
```

## Development Workflow

1. **TDD first** — Write failing test, then implement minimum code to pass
2. **Debug with Chrome plugin** — Start `npm run dev`, use chrome-devtools-mcp to inspect page elements and interact with running app
3. **Run full suite after changes** — `npx vitest run` before committing

## Architecture

```
app/                  # Next.js pages (App Router)
  layout.tsx          # Root layout
  page.tsx            # Entry point → renders TodoApp component

src/
  components/         # React UI layer ('use client', stateful)
    TodoApp/index.tsx # Main todo interface with filters
  core/todo/          # Feature module (framework-agnostic)
    model.ts          # Type definitions: Todo interface
    storage.ts        # Persistence abstraction: localStorage wrapper
    repository.ts     # CRUD business logic using storage layer
    index.ts          # Barrel exports
  __tests__/          # Test setup (localStorage mock, globals)
```

**Key patterns:**
- `src/core/*` — Feature modules with co-located files: model → storage → repository → UI. Each layer depends only on the one below it.
- `src/components/*` — React components only. Data ops go through repository layer.
- Tests mirror source structure: `<file>.ts` → `<file>.test.ts` co-located
- localStorage key: `'todos'`, stores JSON array of `{ id, title, completed }`

## SSR Safety

⚠️ Next.js renders on the server by default. Browser APIs like `localStorage` are undefined during SSR.

**Rule:** Always check `typeof localStorage !== 'undefined'` (or `typeof window !== 'undefined'`) before accessing any browser API. Never use bare try/catch as the sole guard — it swallows real errors and hides SSR issues. Use the typeof check for the SSR boundary, then wrap in try/catch only for runtime failures (storage full, private mode).

```typescript
// ✅ Correct pattern
const canUseStorage = typeof localStorage !== 'undefined'
if (!canUseStorage) return [] as T[]
try { /* browser API call */ } catch (e: unknown) { console.error(e) }

// ❌ Wrong — bare try/catch alone misses SSR context entirely
try { localStorage.getItem('key') } catch { /* silent fail */ }
```

## Working With This Project

- **CLAUDE.md is living documentation.** When instructed during a task to update conventions, patterns, or lessons learned, edit this file directly. Do not wait for explicit "update CLAUDE.md" requests if the knowledge is worth retaining across sessions.

## Testing Conventions

- Framework: vitest + @testing-library/react + user-event
- Environment: happy-dom (not jsdom)
- Setup file: `src/__tests__/setup.ts` — mocks localStorage globally
- Test files co-located with source: `<file>.test.ts` alongside `<file>.ts`
- For UI interaction tests, use `user.click()` / `user.type()` pattern; avoid raw fireEvent unless necessary

## Next.js Notes

⚠️ This is Next.js 16 (App Router). Breaking changes from older versions. Check `node_modules/next/dist/docs/` for latest API docs before writing code.

## Known API Errors & Pitfalls

### tool_result.content array non-text blocks

**Error:** `API Error: 400 {"type":"invalid_request_error","message":"Only text tool_result blocks are supported when tool_result.content is an array."}`

**Cause:** Passing non-text blocks (images, tool_use, tool_result nested in content arrays) to the Claude API when `content` is structured as an array. The API only accepts `text` type blocks in this format.

**How to avoid:**
- When building `tool_result` content as an array, ensure every block has `type: "text"` — never include `image`, nested `tool_use`, or other block types
- If you need to reference tool output that contains images or structured data, convert it to a text description/string first
- Never pass raw multi-modal responses back into tool_result arrays without stripping non-text blocks

### Hydration mismatch: reading localStorage in useState initializer

**Error:** `Hydration failed because the server rendered HTML didn't match the client.`

**Cause:** Using `useState(() => readFromLocalStorage())` — SSR returns `[]`, client reads saved data. Mismatch on first render.

**How to avoid:**
- Never call browser-only APIs (localStorage, window, Date.now) inside `useState` initializer or component body during render
- Use `useState(initialValue)` with a safe default (`[]`, `''`, `false`) → load real data in `useEffect(() => { setData(...) }, [])`
- This ensures SSR and hydration see identical content; client-side data appears after hydration completes
