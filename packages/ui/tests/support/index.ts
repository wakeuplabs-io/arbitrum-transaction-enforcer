import '@synthetixio/synpress/support/index';


// commands
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
            /**
             * Connect the metamask wallet to the dapp
             */
            connectMetamask(): Chainable<void>
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

Cypress.Commands.add('connectMetamask', function () {
    if (Cypress.env("skip_metamask") === true) {
        return this.skip(); // Skipping the test
    }

    // ensure we're disconnected, no harm if we're not connected other than a small warning
    cy.disconnectMetamaskWalletFromDapp() 

    cy.get("#topbar-connect-wallet").click()
    cy.contains("MetaMask").click()
    cy.acceptMetamaskAccess()
})


// hooks

before(() => {
    if (!Cypress.env("skip_metamask")) {
        cy.addMetamaskNetwork({
            networkName: 'arbitrum-sepolia',
            rpcUrl: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
            chainId: 421614,
            symbol: 'ETH',
            blockExplorer: 'https://sepolia.arbiscan.io/',
            isTestnet: true,
        })
    }
})
