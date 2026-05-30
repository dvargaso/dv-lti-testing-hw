const BACKEND = 'http://localhost:3010'

// Sets up intercepts for both GET calls the Position Details page makes on mount.
// Call before cy.visit() so intercepts are registered before requests fire.
Cypress.Commands.add('interceptPositionPage', (positionId = 1) => {
  cy.intercept(
    'GET',
    `${BACKEND}/positions/${positionId}/interviewFlow`,
    { fixture: 'interviewFlow.json' }
  ).as('getInterviewFlow')

  cy.intercept(
    'GET',
    `${BACKEND}/positions/${positionId}/candidates`,
    { fixture: 'candidates.json' }
  ).as('getCandidates')
})

// rbd attaches mousemove/mouseup to window, not to DOM elements, so
// cy.trigger() doesn't reach its handlers. Dispatch directly via win.dispatchEvent().
function fireMouseEvent(win, type, x, y, buttons = 1) {
  win.dispatchEvent(new win.MouseEvent(type, {
    bubbles: true, cancelable: true, view: win, button: 0, buttons, clientX: x, clientY: y,
  }))
}

// Simulates a drag-and-drop for react-beautiful-dnd.
// rbd ignores HTML5 drag events and uses its own pointer event handling,
// so this is the minimum viable approach without cypress-real-events.
// If tests become flaky, replace with: npm i -D cypress-real-events
// and use cy.realMouseDown() / cy.realMouseMove() / cy.realMouseUp().
Cypress.Commands.add('dragTo', { prevSubject: 'element' }, (source, targetAlias) => {
  cy.get(targetAlias).then($target => {
    const tgtRect = $target[0].getBoundingClientRect()
    const tgtX = tgtRect.left + tgtRect.width / 2
    const tgtY = tgtRect.top + tgtRect.height / 2

    const srcRect = source[0].getBoundingClientRect()
    const srcX = srcRect.left + srcRect.width / 2
    const srcY = srcRect.top + srcRect.height / 2

    cy.wrap(source)
      .trigger('mousedown', { button: 0, buttons: 1, clientX: srcX, clientY: srcY, force: true })

    cy.window().then(win => fireMouseEvent(win, 'mousemove', srcX + 10, srcY))
    cy.window().then(win => fireMouseEvent(win, 'mousemove', tgtX, tgtY))
    // rbd throttles MOVE processing through requestAnimationFrame — wait one
    // rAF cycle so the destination column is committed before DROP fires.
    cy.window().then(win => new Cypress.Promise(resolve => win.requestAnimationFrame(resolve)))
    cy.window().then(win => fireMouseEvent(win, 'mouseup', tgtX, tgtY, 0))
  })
})
