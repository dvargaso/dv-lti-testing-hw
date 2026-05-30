# E2E Testing Rules

## Scope
Tests live in `cypress/integration/` as `*.spec.js` files. Specs cover user-facing flows through the React frontend (port 3000) against the Express backend (port 3010). Backend integration tests belong in `backend/src/`.

## Selector Strategy
Priority order: `data-cy` attribute → ARIA role (`cy.findByRole`) → label (`cy.findByLabelText`) → `data-testid`. Never select by CSS class, inline style, or position (`:nth-child`, `:first`). Add a `data-cy` attribute to the source when no stable selector exists. Class refactors must not break tests.

## Test Independence
Every spec must pass when run alone: `cypress run --spec cypress/integration/path/to/spec.spec.js`. Reset state in `beforeEach`. Never depend on test order or share mutable state across `it` blocks.

## Test Data
Run a dedicated `db_test` service defined in `docker-compose.yml` pointing to `LTIdb_test`. Reset it before each run with `prisma migrate reset`. Use `cy.task()` backed by Prisma (registered in `setupNodeEvents` inside `cypress.config.js`) for per-test record setup and teardown — base tasks on the existing `backend/prisma/seed.ts`. Use `@faker-js/faker` for dynamic fields (names, emails) to avoid collisions. Never hardcode database IDs.

```js
// example usage in a spec
beforeEach(() => {
  cy.task('db:seed:candidate', { firstName: faker.person.firstName() })
})
afterEach(() => {
  cy.task('db:teardown')
})
```

## Flakiness Prevention
Never use `cy.wait(n)` with a hardcoded timeout — always wait on an alias (`cy.wait('@alias')`) or a DOM condition. Use `cy.findByRole` / `cy.findByText` with built-in retry rather than chained `.should('be.visible')`. If a test is skipped (`it.skip`), it is tech debt — add a comment with a ticket reference or delete it.

## Maintenance
Every new UI feature must include or update a spec. Custom commands for repeated flows (login, navigation, form fills) are required and live in `cypress/support/commands.js`. Prune dead specs during major refactors.
