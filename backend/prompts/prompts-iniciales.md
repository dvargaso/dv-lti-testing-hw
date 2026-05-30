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
