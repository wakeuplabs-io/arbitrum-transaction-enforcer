
describe("/", () => {

    it("should block the continue button if the user doesn't connect wallet", () => {
        // prepare
        cy.visit("/")

        // assert
        cy.get("#continue-btn").should("be.disabled").should("contain.text", "Connect your wallet to withdraw")
    })


    it("should load wallet balances in arbitrum after connecting", () => {
        // prepare
        cy.visit("/")
        cy.connectMetamask()
        
        // assert
        cy.contains("Continue", { timeout: 10000 }).should("exist") // determines balance is ready
        cy.get("#balance").then((e) => {
            // TODO: ideally we have a fixed wallet and we get compare balance
            expect(e.text.length).to.be.greaterThan(0)
        })
    })

    it("should warn against negative amounts", () => {
        // prepare
        cy.visit("/")
        cy.connectMetamask()

        // assert
        cy.on('window:alert', (text) => {
            expect(text).to.equal('Only values greater than 0');
        });

        cy.get("#amount-input").type('-1')
        cy.contains("Continue", { timeout: 10000 }).click() 
    })

    it("should warn against zero amounts", () => {
        // prepare
        cy.visit("/")
        cy.connectMetamask()

        // assert
        cy.on('window:alert', (text) => {
            expect(text).to.equal('Only values greater than 0');
        });

        cy.get("#amount-input").type("0")
        cy.contains("Continue", { timeout: 10000 }).click()

    })

    it("should redirect to /withdraw with the proper amount in wei as a search param", () => {
        // prepare
        cy.visit("/")
        cy.connectMetamask()
        cy.get("#amount-input").type("0.0000000001")
        cy.contains("Continue", { timeout: 10000 }).click()

        // assert
        cy.url().then(u => {
            const url = new URL(u);
            const params = new URLSearchParams(url.search);

            const amount = params.get("amount")
            expect(amount).to.be.not.null
            expect(String(amount).replace(/"/g, '')).to.equal("100000000")
        })
    })
})
