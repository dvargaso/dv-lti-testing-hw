# E2E Testing Rules

## Scope
Tests live in `cypress/integration/` as `*.spec.js` files. Specs cover user-facing flows through the React frontend (port 3000). Only the frontend needs to be running — all backend calls are intercepted. Backend integration tests belong in `backend/src/`.

## Selector Strategy
Priority order: `data-cy` attribute > ARIA role (`cy.findByRole`) > label (`cy.findByLabelText`) > `data-testid`. Never select by CSS class, inline style, or position (`:nth-child`, `:first`). Add a `data-cy` attribute to the source when no stable selector exists. Class refactors must not break tests.

## Test Independence
Every spec must pass when run alone: `cypress run --spec cypress/integration/path/to/spec.spec.js`. Reset state in `beforeEach`. Never depend on test order or share mutable state across `it` blocks.

## Test Data
Stub all API calls with `cy.intercept()` — tests must not hit `localhost:3010` for real. Store response payloads as fixtures in `cypress/fixtures/` and keep them in sync with `backend/api-spec.yaml`. Use `@faker-js/faker` for any dynamic fields to avoid hardcoded values that could rot.

```js
// example usage in a spec
beforeEach(() => {
  cy.intercept('GET', 'http://localhost:3010/positions/*/candidates', { fixture: 'candidates.json' }).as('getCandidates')
  cy.visit('/positions/1')
  cy.wait('@getCandidates')
})
```

## Flakiness Prevention
Never use `cy.wait(n)` with a hardcoded timeout — always wait on an alias (`cy.wait('@alias')`) or a DOM condition. Use `cy.findByRole` / `cy.findByText` with built-in retry rather than chained `.should('be.visible')`. If a test is skipped (`it.skip`), it is tech debt — add a comment with a ticket reference or delete it.

## Maintenance
Every new UI feature must include or update a spec. Custom commands for repeated flows (login, navigation, form fills) are required and live in `cypress/support/commands.js`. Prune dead specs during major refactors.
