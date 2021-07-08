const newTests = artifacts.require("newTests");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("newTests", function (/* accounts */) {
  it("should assert true", async function () {
    await newTests.deployed();
    return assert.isTrue(true);
  });
});
