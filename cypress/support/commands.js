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

// Simulates a drag-and-drop using pointer events.
// react-beautiful-dnd ignores HTML5 drag events and uses its own pointer event
// handling, so this is the minimum viable approach without cypress-real-events.
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

    // Each event gets its own Cypress command tick so React 18 can flush
    // the MOVE state update before the DROP fires.
    const mouseEvent = (win, type, x, y, buttons = 1) =>
      win.dispatchEvent(new win.MouseEvent(type, {
        bubbles: true, cancelable: true, view: win, button: 0, buttons, clientX: x, clientY: y,
      }))

    cy.window().then(win => mouseEvent(win, 'mousemove', srcX + 10, srcY))
    cy.window().then(win => mouseEvent(win, 'mousemove', tgtX, tgtY))
    // rbd throttles MOVE processing through requestAnimationFrame.
    // Wait for one rAF cycle (~16ms) before sending mouseup so the MOVE
    // state is committed and rbd detects the correct destination column.
    cy.window().then(win => new Cypress.Promise(resolve => win.requestAnimationFrame(resolve)))
    cy.window().then(win => mouseEvent(win, 'mouseup',   tgtX, tgtY, 0))
  })
})
