const { expect, emit } = require("chai");
const { ethers } = require("hardhat");

// const OpenSpeak = artifacts.require("OpenSpeak2");

// describe("Greeter", function () {
//   it("Should return the new greeting once it's changed", async function () {
//     const Greeter = await ethers.getContractFactory("Greeter");
//     const greeter = await Greeter.deploy("Hello, world!");
//     await greeter.deployed();

//     expect(await greeter.greet()).to.equal("Hello, world!");

//     const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

//     // wait until the transaction is mined
//     await setGreetingTx.wait();

//     expect(await greeter.greet()).to.equal("Hola, mundo!");
//   });
// });

// Vanilla Mocha test. Increased compatibility with tools that integrate Mocha.
describe("OpenSpeak2 contract", function () {
  let accounts;
  let OpenSpeak2;
  let contract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    // accounts = await web3.eth.getAccounts();
      [owner, addr1, addr2] = await ethers.getSigners();
      OpenSpeak2 = await ethers.getContractFactory("OpenSpeak2");
      contract = await OpenSpeak2.deploy();
  });

  describe("Deployment", function () {
    it("Should let me post without an account", async function (done) {
      
      await contract.deployed();
      console.log('Contract deployed at %s',await contract.address);
      console.log('Posting as user %s',await addr1.address);
      await expect(contract.connect(addr1).say("Qzxyzl123hhackacieklksdicjq"))
                  .to.emit(contract, "publicSpeech")
                .withArgs([["Qzxyzl123hhackacieklksdicjq"],[await addr1.address,""]]);

    });
  });
});