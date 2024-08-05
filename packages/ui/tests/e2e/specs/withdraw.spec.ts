import { formatEther } from "ethers/lib/utils";


describe("/withdraw", () => {
    let withdrawAmount: string

    beforeEach(() => {
      withdrawAmount = "1000000000000000000"
      cy.clearAllLocalStorage()
    })

    it("should receive amount as a search param and display it in ether", () => {
        // prepare
        cy.visit(`/withdraw?amount="${withdrawAmount}"`)

        // assert
        cy.get("[data-test-id='withdraw-amount']").should("have.text", formatEther(withdrawAmount))
    })

    it("should redirect to / if amount is below 0", () => {
        // prepare
        cy.visit(`/withdraw?amount="-${withdrawAmount}"`)
        
        // assert
        cy.url().should("eq", Cypress.config().baseUrl)
    })
    
    it("should redirect to / if amount is not a valid value", () => {
        // prepare
        cy.visit(`/withdraw?amount="invalid"`)
        
        // assert
        cy.url().should("eq", Cypress.config().baseUrl)
    })

    it("should redirect to / if amount is not provided", () => {
        // prepare
        cy.visit(`/withdraw`)
        
        // assert
        cy.url().should("eq", Cypress.config().baseUrl)
    })

    it("should block the confirm button if the user doesn't check the conditions", () => {
        // prepare
        cy.visit(`/withdraw?amount="${withdrawAmount}"`)

        // assert
        cy.contains("Confirm Withdrawal").should("be.disabled")
    })

    it("should enable the confirm button if the user checks the conditions", () => {
        // prepare
        cy.visit(`/withdraw?amount="${withdrawAmount}"`)
        cy.get("#terms-time").click()
        cy.get("#terms-fees").click()
        cy.get("#terms-sequencer").click()

        // assert
        cy.contains("Confirm Withdrawal").should("not.be.disabled")
    })
})