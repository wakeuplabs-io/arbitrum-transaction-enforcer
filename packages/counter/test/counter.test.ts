// test/Counter.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { Counter } from "../typechain-types";

describe("Counter", function () {
  let counter: Counter;

  beforeEach(async function () {
    const Counter = await ethers.getContractFactory("Counter");
    counter = (await Counter.deploy()) as Counter;
  });

  it("should start with a count of 0", async function () {
    expect(await counter.count()).to.equal(0);
  });

  it("should increment the count", async function () {
    await counter.increment();
    expect(await counter.count()).to.equal(1);
  });

  it("should decrement the count", async function () {
    await counter.increment();
    await counter.increment();
    await counter.decrement();
    expect(await counter.count()).to.equal(1);
  });

  it("should not allow decrement below zero", async function () {
    await expect(counter.decrement()).to.be.revertedWith("Counter: cannot decrement below zero");
  });
});
