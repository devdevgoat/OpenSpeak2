const { expect } = require("chai");
const { ethers } = require("hardhat");

const OpenSpeak = artifacts.require("OpenSpeak2");

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
  let OpenSpeak2;
  let contract;
  let owner, addr1, addr2;
  let tx, receipt;
  let cid = "THEFIRSTCID";
  let cid2 = "ANOTHERCID"
  let reply1cid = "AREPLYTOYOURCID";
  let nullCid = "-Q";
  let nullAbout = "You do not have a profile yet.";
  let defaultImgCid = "Qmct64QyUMykB5GB4Uq8AV2x4LrAGgYuHEamBdaJ5AwyMw";
  let defaultAboutBlurb = "A user of software. A believer of freedom. A default about blurb.";
  let newAbout = "NEW INFO ABOUT ME!";
  let newCid = "SOMEOTHERCID";


  before(async function () {
      [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
      OpenSpeak2 = await ethers.getContractFactory("OpenSpeak2");
      contract = await OpenSpeak2.deploy();
      await contract.deployed()
      // tx = await contract.connect(addr1).say("Qzxyzl123hhackacieklksdicjq");
      // receipt = await tx.wait()

      // console.log(receipt.events[0]);
      // for (const event of receipt.events) {
      //   console.log(`${event.event}:[${event.args}]`);
      // }
  });
  // describe("",()=>{
  //       it("",async () =>{

  //       });
  // });
  // good example https://github.com/fvictorio/hardhat-examples/blob/master/reading-events/scripts/getEventsFromTx.js
  describe("Deployment and Execution", function () {

    describe("Users can do the posting", function () {

      describe("New Users",()=>{
        
        it(`User should not have a profile`,async () =>{
          expect(await contract.connect(addr1).hasProfile()).to.equal(false);
        });

        it(`User should be able to say "${cid}" and get a profile event and a say event`,async () =>{
          expect(await contract.connect(addr1).say(cid,""))
            .to.emit(contract,"newUserJoinedTheParty").withArgs(addr1.address)
            .and.to.emit(contract,"publicSpeech").withArgs(addr1.address,cid,"");
        });
      });
    
      describe("Existing Users",()=>{
        it(`Previous user should now have a profile`,async () =>{
          expect(await contract.connect(addr1).hasProfile()).to.equal(true);
        });
        it(`Previous user can post again, and not emit profile event`,async () =>{
          expect(await contract.connect(addr1).say(cid2,""))
            .to.emit(contract,"publicSpeech").withArgs(addr1.address,cid2,"")
            .and.to.not.emit(contract,"newUserJoinedTheParty").withArgs(addr1.address)
            ;
        });
      });

      describe("New Users can Reply to existing posts",()=>{

        it(`New user sends reply to ${cid} of ${reply1cid}`, async () =>{
          expect(await contract.connect(addr2).say(reply1cid,cid))
            .to.emit(contract,"publicSpeech").withArgs(addr2.address,reply1cid,cid)
            .and.to.emit(contract,"newUserJoinedTheParty").withArgs(addr2.address);
        });
        
      })


    });
   
    describe("Users can do profile updating",() => {
     describe("New Users",() => {
       it(`User does not have a profile yet`,async () => {
         expect(await contract.connect(addr3).hasProfile()).to.equal(false);
       });
       it(`Checking the users profile returns null cid "${nullCid}"`,async () => {    
          expect(await contract.connect(addr3).getProfileImgCid()).to.equal(nullCid);
       });
       it(`Checking the users profile returns null about "${nullAbout}"`,async () => {    
          expect(await contract.connect(addr3).getAboutBlurb()).to.equal(nullAbout);
       });
       it(`User can create profile`,async () => {
         await contract.connect(addr3).getOrMakeProfile();
         expect(await contract.connect(addr3).hasProfile()).to.equal(true);
       });
       it(`User has default image "${defaultImgCid}"`,async () => {
          expect(await contract.connect(addr3).getProfileImgCid()).to.equal(defaultImgCid);
       });
       it(`User has default about blurb "${defaultAboutBlurb}"`,async () => {
          expect(await contract.connect(addr3).getAboutBlurb()).to.equal(defaultAboutBlurb);
       });
    });
     describe("Existing Users",() => {
        it(`Existing users can change the profile picture`,async () => {
          expect(await contract.connect(addr3).setProfileImgCid(newCid))
                  .to.emit(contract, "newProfileImg")
                  .withArgs(addr3.address,newCid);
        });
        it(`Existing users can change their about blurb`,async () => {
          expect(await contract.connect(addr3).setAboutBlurb(newAbout))
                  .to.emit(contract, "newAboutBlurb")
                  .withArgs(addr3.address,newAbout);
        });
        it(`User has new image "${newCid}"`,async () => {
          expect(await contract.connect(addr3).getProfileImgCid()).to.equal(newCid);
        });
        it(`User has default about blurb "${newAbout}"`,async () => {
          expect(await contract.connect(addr3).getAboutBlurb()).to.equal(newAbout);
       });
    });


    });


  });
});