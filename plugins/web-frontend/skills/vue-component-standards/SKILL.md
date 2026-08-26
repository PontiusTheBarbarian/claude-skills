---
name: vue-component-standards
description: Use when creating or reviewing Vue 3 components, composables, or Pinia stores — Composition API with script setup, TypeScript props/emits, folder structure, and state management conventions. Applies to any .vue file or frontend code review.
---

# Vue 3 component standards

## Composition API + `<script setup>`, always

No Options API in new code. Every component uses `<script setup lang="ts">`:

```vue
<script setup lang="ts">
interface Props {
  orderId: string
  compact?: boolean
}
const props = withDefaults(defineProps<Props>(), { compact: false })

const emit = defineEmits<{
  cancelled: [orderId: string]
}>()
</script>
```

- Props and emits are typed via the generic `defineProps<T>()` /
  `defineEmits<T>()` syntax, not the runtime array/object form — you get
  compile-time checking and the props show up correctly in IDE tooling.
- Use `withDefaults` for optional props rather than defaulting inside the
  template or a `watch`.

## Folder structure

```
src/
  components/        Dumb/presentational components — props in, events out,
                       no direct API calls.
  views/              Route-level components, composed from components/.
  composables/        use*.ts — reusable reactive logic (useOrders, useAuth).
  stores/              Pinia stores — cross-component/app-wide state only.
  api/                 Typed API client functions, one module per resource.
  types/               Shared TypeScript types/interfaces.
```

A component that fetches its own data via an API client directly, instead of
receiving it via props or a composable, is a sign it should be a `view`
composing a `composable`, not a reusable `component`.

## Composables over mixins or ad hoc `watch` soup

Extract reusable stateful logic into a `use*` composable rather than
duplicating it across components:

```ts
// composables/useOrderStatus.ts
export function useOrderStatus(orderId: Ref<string>) {
  const status = ref<OrderStatus | null>(null)
  const isLoading = ref(false)

  async function refresh() {
    isLoading.value = true
    try {
      status.value = await fetchOrderStatus(orderId.value)
    } finally {
      isLoading.value = false
    }
  }

  return { status, isLoading, refresh }
}
```

## Pinia for shared state

Reach for a Pinia store only when state is genuinely shared across
components that aren't in a parent/child relationship (auth session, cart).
Local UI state (`isMenuOpen`, form inputs) stays in the component with
`ref`/`reactive` — don't default everything into a store.

```ts
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => user.value !== null)
  async function login(credentials: LoginRequest) { /* ... */ }
  return { user, isAuthenticated, login }
})
```

Use the setup-style store definition (function form) shown above, matching
`<script setup>` conventions, rather than the Options-style store.

## API layer

One typed function per backend endpoint, matching the DTOs described in
`dotnet-rest-api-design`, so a backend contract change is a TypeScript error
at the call site instead of a runtime surprise:

```ts
// api/orders.ts
export async function fetchOrder(id: string): Promise<OrderResponse> {
  const { data } = await httpClient.get<OrderResponse>(`/api/v1/orders/${id}`)
  return data
}
```

## Review checklist

- [ ] `<script setup lang="ts">`, typed `defineProps`/`defineEmits`.
- [ ] Components in `components/` don't call the API client directly.
- [ ] Reusable stateful logic is a composable, not copy-pasted `watch`
      blocks across components.
- [ ] New Pinia store is genuinely cross-component state, not local UI
      state that leaked into global scope.
- [ ] Every new interactive component has also been checked against
      `web-accessibility-review`.
