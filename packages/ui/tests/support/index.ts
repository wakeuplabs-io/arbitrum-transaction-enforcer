import "dotenv/config"
import '@synthetixio/synpress/support/index';

declare global {
    namespace Cypress {
        interface Chainable {
            /**
             * If metamask is required for the test, it will skip the test if the environment variable `skip_metamask` is set to true.
             * @example cy.requiresMetamask()
             */
            requiresMetamask(): void
            /**
             *  Set the value of a key in the local storage
             * @param key 
             * @param value 
             */
            setLocalStorage(key: string, value: string): Chainable<void>
            /**
             * Get the value of a key in the local storage
             * @param key 
             */
            getLocalStorage(key: string): Chainable<string | null>
        }
    }
}

Cypress.Commands.add('requiresMetamask', function () {
    if (Cypress.env("skip_metamask") === true) {
        this.skip(); // Skipping the test
    }
});

Cypress.Commands.add('setLocalStorage', (key, value) => {
    cy.window().then((window) => {
        window.localStorage.setItem(key, value);
    });
});

Cypress.Commands.add('getLocalStorage', (key) => {
    cy.window().then((window) => {
        return window.localStorage.getItem(key);
    });
});
