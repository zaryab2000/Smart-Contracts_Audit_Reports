// const Queue = artifacts.require('Queue');

// const { util } = require("chai");
// var chai = require("chai");
// var chaiAsPromised = require("chai-as-promised");

// chai.use(chaiAsPromised);
// chai.use(require('bn-chai')(web3.utils.BN));
// // Then either:
// var expect = chai.expect;
// const f = () => expect.fail("impement me");

// contract('Queue', async(accounts) => {
//     const owner = accounts[0];

//     beforeEach(async () => {
//         q = await Queue.new({ from: owner})
//     })
//     it('should start empty', async () => {
//         const len = await q.length()
//         expect(len).to.eq.BN(web3.utils.toBN(0));
//     })
//     it('should enqueue', async() => {
//         const prevLen = await q.length()

//         await q.enqueue(1)
        
//         const len = await q.length()
//         expect(len).to.eq.BN(prevLen.add(web3.utils.toBN(1)));
//     })

//     it('should dequeue', async() => {
//         await q.enqueue(1)
//         const prevLen = await q.length()
//         await q.dequeue()
//         const len = await q.length()
//         expect(len).to.eq.BN(prevLen.sub(web3.utils.toBN(1)));
//     })

//     it('should preview next element', async() => {
//         await q.enqueue(1)
//         await q.enqueue(2)
//         await q.enqueue(3)
//         expect(await q.length()).to.eq.BN(web3.utils.toBN(3))
//         const next = await q.next()
//         expect(next).to.eq.BN(1);
//         expect(await q.length()).to.eq.BN(web3.utils.toBN(3))
//     })
// })