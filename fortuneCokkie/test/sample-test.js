const { expect } = require("chai");

describe("FortuneCookieV2", function() {
  it("Should return the new greeting once it's changed", async function() {
    const Greeter = await ethers.getContractFactory("FortuneCookieV2");
    const greeter = await Greeter.deploy();
    
    await greeter.deployed();
    const totalSupply = await greeter.totalSupply()
    console.log(totalSupply.toString())

   
  });
});
