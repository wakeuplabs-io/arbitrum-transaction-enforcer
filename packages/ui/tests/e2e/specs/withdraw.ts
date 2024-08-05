import { formatEther } from "ethers/lib/utils";


describe("/withdraw", () => {
    let withdrawAmount: string

    beforeEach(() => {
      withdrawAmount = "1000000000000000000"
    })

    it("should receive amount as a search param and display it in ether", () => {
        cy.visit(`/withdraw?amount="${withdrawAmount}"`)
        cy.get("[data-test-id='withdraw-amount']").should("have.text", formatEther(withdrawAmount))
    })

    it("should redirect to / if amount is below 0", () => {
        cy.visit(`/withdraw?amount="-${withdrawAmount}"`)
        
        cy.url().should("eq", Cypress.config().baseUrl)
    })

    
    it("should redirect to / if amount is not a valid value", () => {
        cy.visit(`/withdraw?amount="invalid"`)
        
        cy.url().should("eq", Cypress.config().baseUrl)
    })

    it("should redirect to / if amount is not provided", () => {
        cy.visit(`/withdraw`)
        
        cy.url().should("eq", Cypress.config().baseUrl)
    })

    it("should block the confirm button if the user doesn't check the conditions", () => {
        cy.visit(`/withdraw?amount="${withdrawAmount}"`)
        cy.contains("Confirm Withdrawal").should("be.disabled")
    })

    it("should enable the confirm button if the user checks the conditions", () => {
        cy.visit(`/withdraw?amount="${withdrawAmount}"`)
        
        // Check the terms
        cy.get("#terms-time").click()
        cy.get("#terms-fees").click()
        cy.get("#terms-sequencer").click()

        cy.contains("Confirm Withdrawal").should("not.be.disabled")
    })
})