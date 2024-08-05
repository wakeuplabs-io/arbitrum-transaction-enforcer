import "dotenv/config"
import '@synthetixio/synpress/support/index';

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * Custom command to select DOM element by data-cy attribute.
             * @example cy.dataCy('greeting')
             */
            requiresMetamask(): void
        }
    }
}

Cypress.Commands.add('requiresMetamask', function () {
    if (Cypress.env("skip_metamask")  === true) {
        this.skip(); // Skipping the test
    }
});