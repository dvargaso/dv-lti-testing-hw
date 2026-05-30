// Covers: Position Details page load and candidate phase change (drag-and-drop).
//
// Fixture assumptions (cypress/fixtures/):
//   interviewFlow.json — 3 steps: Initial Screening (id:1), Technical Interview (id:2), Manager Interview (id:3)
//   candidates.json    — Carlos García in Initial Screening; John Doe + Jane Smith in Technical Interview

const POSITION_ID = 1
const BACKEND = 'http://localhost:3010'

describe('Position Details Page', () => {
  beforeEach(() => {
    cy.interceptPositionPage(POSITION_ID)
    cy.visit(`/positions/${POSITION_ID}`)
    cy.wait(['@getInterviewFlow', '@getCandidates'])
  })

  context('page loads correctly', () => {
    it('shows the position title', () => {
      cy.get('[data-cy="position-title"]')
        .should('be.visible')
        .and('contain.text', 'Senior Full-Stack Engineer')
    })

    it('renders all three interview stage columns', () => {
      cy.get('[data-cy="stage-title"]').should('have.length', 3)
      cy.get('[data-cy="stage-title"]').eq(0).should('contain.text', 'Initial Screening')
      cy.get('[data-cy="stage-title"]').eq(1).should('contain.text', 'Technical Interview')
      cy.get('[data-cy="stage-title"]').eq(2).should('contain.text', 'Manager Interview')
    })

    it('places each candidate card in the correct stage column', () => {
      // Carlos García is in Initial Screening
      cy.get('[data-cy="stage-column"]').eq(0).within(() => {
        cy.get('[data-cy="candidate-card"]').should('have.length', 1)
        cy.get('[data-cy="candidate-card"]').should('contain.text', 'Carlos García')
      })

      // John Doe and Jane Smith are in Technical Interview
      cy.get('[data-cy="stage-column"]').eq(1).within(() => {
        cy.get('[data-cy="candidate-card"]').should('have.length', 2)
        cy.get('[data-cy="candidate-card"]').should('contain.text', 'John Doe')
        cy.get('[data-cy="candidate-card"]').should('contain.text', 'Jane Smith')
      })

      // Manager Interview starts empty
      cy.get('[data-cy="stage-column"]').eq(2).within(() => {
        cy.get('[data-cy="candidate-card"]').should('not.exist')
      })
    })

    it('renders rating indicators for candidates with a score', () => {
      // John Doe has averageScore: 5 → five green circles
      cy.get('[data-cy="stage-column"]').eq(1)
        .contains('[data-cy="candidate-card"]', 'John Doe')
        .find('[aria-label="rating"]')
        .should('have.length', 5)
    })

    it('renders no rating indicators for candidates without a score', () => {
      // Carlos García has averageScore: 0 → no rating icons
      cy.get('[data-cy="stage-column"]').eq(0)
        .contains('[data-cy="candidate-card"]', 'Carlos García')
        .find('[aria-label="rating"]')
        .should('not.exist')
    })
  })

  context('candidate phase change via drag and drop', () => {
    beforeEach(() => {
      cy.intercept('PUT', `${BACKEND}/candidates/*`, {
        statusCode: 200,
        body: { message: 'Candidate stage updated successfully' },
      }).as('updateStage')

      cy.get('[data-cy="stage-column"]').eq(1).as('technicalColumn')

      cy.get('[data-cy="stage-column"]').eq(0)
        .contains('[data-cy="candidate-card"]', 'Carlos García')
        .dragTo('@technicalColumn')
    })

    it('moves the candidate card to the destination column', () => {
      cy.get('@technicalColumn').within(() => {
        cy.get('[data-cy="candidate-card"]').should('contain.text', 'Carlos García')
      })
    })

    it('removes the candidate card from the source column after the move', () => {
      cy.get('[data-cy="stage-column"]').eq(0).within(() => {
        cy.get('[data-cy="candidate-card"]').should('not.exist')
      })
    })

    it('calls PUT /candidates/:id with applicationId and the destination step id', () => {
      // Moving Carlos García (candidateId:3, applicationId:4) to Technical Interview (stepId:2)
      cy.wait('@updateStage').its('request.body').should('deep.equal', {
        applicationId: 4,
        currentInterviewStep: 2,
      })
    })

    it('targets the correct candidate id in the PUT URL', () => {
      // candidateId:3 must appear in the URL — not applicationId or stepId
      cy.intercept('PUT', `${BACKEND}/candidates/3`).as('updateCorrectCandidate')
      cy.wait('@updateCorrectCandidate')
    })
  })
})
