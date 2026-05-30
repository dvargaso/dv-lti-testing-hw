## e2e rules definition

Act as a senior QA engineer expert in e2e testing with Cypress

Create an e2e.md rules file for Cypress E2E testing.

Before creating it, ask any important clarifying questions. Then show me a draft for review. Do not save the file until I approve it.

Keep the rules short, practical.

The file should use this structure:

# E2E Testing Rules

## Scope
## Selector Strategy
## Test Independence
## Test Data
## Network Mocking
## CI/CD Execution
## Failure Debugging
## Flakiness Prevention
## Maintenance


Include these rules at a minimum:

- Prefer accessible/stable selectors over fragile CSS selectors. Prioritize getByRole, getByLabel, and getByTestId when available. Class changes should not break tests.
- Run E2E tests in CI/CD, ideally GitHub Actions. Use parallelization/sharding when useful and cache Cypress dependencies.
- Use realistic test data with fixtures, factories, @faker-js/faker, and seeded environments close to production.
- Tests must be independent and able to run alone or in any order.
- Capture screenshots, videos, logs, or other artifacts on CI failures.
- Keep tests maintained as the system changes. Skipped or ignored tests are technical debt.

Reference the e2e.md from CLAUDE.md


# Implement e2e tests

Implement a small set of Cypress E2E tests for the Position page.

Follow the project e2e.md rules and Cypress spec best practices: clear test names, stable selectors, independent tests, realistic test data, cy.intercept() for API assertions, and no fragile waits.

Also validate the test logic against expected CTS business rules and behavior. Flag any flaws, missing cases, or assumptions before coding.

Cover these scenarios:

1. Position page loads correctly:
    * the position title is visible
    * hiring process phase columns are visible
    * candidate cards appear in the correct column based on their current phase
2. Candidate phase change:
    * drag a candidate card from one phase column to another
    * verify the card appears in the new column
    * verify the backend is updated through PUT /candidate/:id

Before coding, inspect the existing Cypress setup, routes, selectors, fixtures, API patterns, and candidate workflow rules. Reuse existing conventions. Ask only necessary questions before implementing.