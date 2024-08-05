

describe("/", () => {
    it("should display the home page", () => {
        // cy.visit("/")
        // cy.setupMetamask();
        cy.log("JUA U")
        cy.visit("/");
        cy.log("JUA U")
        console.log("JUA U")
    })

    xit("should disable continue button if wallet is not connected", () => {
        cy.visit("/")
        cy.get("[data-test-id='continue-btn']")
            .should("contain.text", "Connect your wallet to withdraw")
            .should("be.disabled")
    })

    xit("should load wallet balances in arbitrum after connecting", () => {
        cy.visit("/")
        cy.log("abc")
        cy.get("#topbar-connect-wallet").click()
        cy.contains("MetaMask").click()
        cy.log("connect clicked")

        cy.acceptMetamaskAccess().should('be.true');
    })

    xit("should warn against negative amounts", () => {
        
    })

    xit("should warn against zero amounts", () => {

    })

    xit("should redirect to /withdraw with the proper amount in wei as a search param", () => {

    })
})
