---
name: Refactor Client Hooks
about: Refactor client-side hooks to use the server API instead of direct Firebase access
title: 'Refactor: Client hooks to use server API'
labels: refactor, frontend, api
assignees: ''

---

**Task Description**
Refactor existing client-side React hooks (e.g., `useReceipts`, `useInventory`) that currently interact directly with Firebase services (Firestore, Storage) to instead fetch data and perform mutations through the backend API.

**Goals**
- Decouple the frontend from direct Firebase dependencies.
- Centralize data access logic in the backend API.
- Improve security by ensuring all data access goes through authenticated API endpoints.
- Simplify frontend state management related to data fetching.

**Affected Hooks (Initial List - Add more if found)**
- `client/src/features/receipts/hooks/useReceipts.js`
- `client/src/features/inventory/hooks/useInventory.js`
- `client/src/features/inventory/hooks/useStockManagement.js`
- `client/src/hooks/useCategories.js`
- *(Add others as identified)*

**Acceptance Criteria**
- [ ] Identified client hooks are refactored to call corresponding server API endpoints.
- [ ] Direct Firebase SDK calls related to data fetching/mutation are removed from the hooks.
- [ ] Frontend components using these hooks function correctly with the API data.
- [ ] Necessary API endpoints exist on the server (create separate issues if needed).
- [ ] Error handling for API calls is implemented in the hooks.

**Additional Context**
Add any other context or considerations for this refactoring task.
