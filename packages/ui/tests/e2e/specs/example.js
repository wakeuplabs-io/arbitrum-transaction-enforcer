// Define the test suite "Metamask Extension tests"
describe('Metamask Extension tests', () => {

    // Define the test case "connect to DApp with Metamask extension example"
    it('connect to DApp with Metamask extension example', () => {

        // Add a new network to Metamask using the `cy.addMetamaskNetwork()` command
        cy.addMetamaskNetwork({
            networkName: 'Arbitrum sepolia',
            rpcUrl: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
            chainId: '421614',
            symbol: 'ETH',
            blockExplorer: 'https://goerli-optimism.etherscan.io/',
            isTestnet: true,
        })

        // Visit the root URL of the DApp
        cy.visit('/');

        // Click the "Connect" button on the DApp
        cy.contains("Connect").click();

        // Accept the Metamask access request by clicking the "Connect" button in the Metamask popup
        // cy.acceptMetamaskAccess().should('be.true');

        // Assert that the "Connect" button on the DApp shows the text "Connected"
        // cy.get('#connectButton').should('have.text', 'Connected');

    });

    // Define the test case "create transaction example"
    xit('create transaction example', () => {

        // Click the "Send" button on the DApp
        cy.get('#sendButton').click();

        // Confirm the Metamask transaction by clicking the "Confirm" button in the Metamask popup
        cy.confirmMetamaskTransaction().should('be.true');
    });

    // Define the test case "confirm signature example"
    xit('confirm signature example', () => {

        // Click the "Sign" button on the DApp
        cy.get('#ethSign').click();

        // Confirm the Metamask signature request by clicking the "Sign" button in the Metamask popup
        cy.confirmMetamaskSignatureRequest().should('be.true');
    });
})