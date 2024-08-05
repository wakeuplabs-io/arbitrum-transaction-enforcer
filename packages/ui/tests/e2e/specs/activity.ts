import { Transaction } from "../../../src/lib/transactions"

describe("/activity", () => {
    let transactions: Transaction[]

    beforeEach(() => {
        transactions = [
            {
                amount: "1000000000000000000",
                bridgeHash: "0x931c10f761c1bdfba85de0e85db0d414efb9744703b4d6db9a9e7f5c970522bc",
                delayedInboxHash: "0xff268cba66bb2fa4f57529dad590fc2cc3dccf38b09df5005d9f573e15f40e53",
                timestamp: Date.now()
            }
        ]

        cy.clearLocalStorage()
    })

    it("should retrieve transactions from local storage", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit("/activity")

        // assert
        cy.contains("1 ETH").should("exist")
        cy.contains("0x93...22bc").should("exist")
    });

    it("activity tab should link to activity detail", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit("/activity")


        // act
        cy.contains("1 ETH").click()

        //  assert
        cy.url().should("include", `/activity/${transactions[0].bridgeHash}`)
    })


})

describe("/activity/:hash", () => {
    let transactions: Transaction[]

    beforeEach(() => {
        transactions = [
            {
                amount: "1000000000000000000",
                bridgeHash: "0x931c10f761c1bdfba85de0e85db0d414efb9744703b4d6db9a9e7f5c970522bc",
                delayedInboxHash: "0xff268cba66bb2fa4f57529dad590fc2cc3dccf38b09df5005d9f573e15f40e53",
                timestamp: Date.now()
            }
        ]

        cy.clearLocalStorage()
    })

    it("should show not found error if not present in local storage", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit("/activity/non-existent-hash")

        // assert
        cy.contains("Transaction not found").should("exist")
    })

    it("should link to etherscan for tracking delayed inbox tx", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit(`/activity/${transactions[0].bridgeHash}`)

        // assert
        cy.get(`a[href='https://sepolia.etherscan.io/tx/${transactions[0].delayedInboxHash}']`)
            .should("contain.text", "Ethereum delayed inbox tx")
    })

    it("should link to arbitrum scanner for tracking delayed l2 tx", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit(`/activity/${transactions[0].bridgeHash}`)

        // assert
        cy.get(`a[href='https://sepolia.arbiscan.io/tx/${transactions[0].bridgeHash}']`)
            .should("contain.text", "Arbitrum tx")
    })

    it("should show force include button", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit(`/activity/${transactions[0].bridgeHash}`)

        // assert
        cy.contains("Force include").should("be.visible").should("match", "button")
    })

    it("create reminder button should be scheduled 24 hs after tx", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit(`/activity/${transactions[0].bridgeHash}`)

        // assert
        cy.get("a[data-test-id='create-reminder-btn']")  // Adjust the selector to match your specific button
            .invoke('attr', 'href')
            .then((href) => {
                if (!href) {
                    throw new Error("href is not defined")
                }

                expect(href.startsWith("https://www.google.com/calendar/render?action=TEMPLATE")).to.be.true

                const url = new URL(href);
                const params = new URLSearchParams(url.search);

                const dates = params.get("dates")
                if (!dates) {
                    throw new Error("dates is not defined")
                }

                const startDate = parseDateString(dates.split("/")[0])

                const differenceInMillis = startDate.getTime() - transactions[0].timestamp!;
                const differenceInHours = differenceInMillis / (1000 * 60 * 60);

                expect(differenceInHours).to.be.closeTo(24, 1e1); // Tolerance for floating point comparison
            })
    })

    it("create reminder button should be scheduled 24 hs after Date.now() if there's no local timestamp", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify([{
            ...transactions[0],
            timestamp: undefined
        }]))
        cy.visit(`/activity/${transactions[0].bridgeHash}`)

        // assert
        cy.get("a[data-test-id='create-reminder-btn']")  // Adjust the selector to match your specific button
            .invoke('attr', 'href')
            .then((href) => {
                if (!href) {
                    throw new Error("href is not defined")
                }

                expect(href.startsWith("https://www.google.com/calendar/render?action=TEMPLATE")).to.be.true

                const url = new URL(href);
                const params = new URLSearchParams(url.search);

                const dates = params.get("dates")
                if (!dates) {
                    throw new Error("dates is not defined")
                }

                const startDate = parseDateString(dates.split("/")[0])

                const differenceInMillis = startDate.getTime() - Date.now();
                const differenceInHours = differenceInMillis / (1000 * 60 * 60);

                expect(differenceInHours).to.be.closeTo(24, 1e1); // Tolerance for floating point comparison
            })
    })

    it("should link to arbitrum bridge for claiming", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit(`/activity/${transactions[0].bridgeHash}`)

        // assert
        cy.get(`a[href='https://bridge.arbitrum.io/']`)
            .should("contain.text", "Claim funds")
    })

    it("return home should go to /", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit(`/activity/${transactions[0].bridgeHash}`)

        // assert
        cy.contains("Return home").click()
        cy.url().should("eq", Cypress.config().baseUrl)
    })

    it("go to my activity should go to /activity", () => {
        // prepare
        cy.setLocalStorage("transactions", JSON.stringify(transactions))
        cy.visit(`/activity/${transactions[0].bridgeHash}`)

        // assert
        cy.contains("Go to my activity").click()
        cy.url().should("eq", `${Cypress.config().baseUrl}activity`)
    })

})



function parseDateString(dateStr: string): Date {
    // Extract components from the date string
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const hours = dateStr.slice(9, 11);
    const minutes = dateStr.slice(11, 13);
    const seconds = dateStr.slice(13, 15);

    // Create a new Date object using the components
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`);
};
