# My Smart Contract Security Audits 🔐

This repository contains the entire  collection of all the publicly available solidity smart contract audit reports that I have worked on so far.

The repo is updated once or twice a month with new audit reports that I work on. 

Additionally I have included below, details about my experience with security audits, my audit procedures as well as the tools that I use.
    
### My experience with Smart Contract Security Audits 🧑🏼‍💻
I have been contributing my part as a Smart contract security auditor since 2.5 years now. I have worked as well as collaborated with security firms like Solidified, Immunebytes as well as Quillhash etc. 

---
## My Security Audit Procedure 💻
To be very concise, my entire security audit procedure can be summed up in 5 specific steps, mentioned below:
> *Although I plan to write an extensive article on my audit procedure soon, the details below should provide an adequate  gist of it.* 
1.  **Documentation Perusal** 📊

    * The very initial step of my audit is to collect each and every possible detail and documentation about the smart contracts under audit scope.
    * I consider this as my **STEP-ZERO** and its far more imperative than it might look.
    * A through read of the documentation provided, provides an extrenly solid understanding of the intended behaviours of the smart contracts. Its quite significant since it helps gives me a clear picture of ***"how the smart contracts should behave VS how they actually do."*** *Larger the difference between the two, higher the number of bugs/inadequate code.*
    * Additionally, for bulkier contracts, documentation plays a significant role in creating an effective mental model of the entire smart contract architecture, considering the documentation are written adequately.

2. **Automated Testing & Structural Analysis** 🔎
    * **Automated testing**, in simpler terms, is using tools on the smart contracts under scope to figure out the presence of any well-known bugs in the contracts.
    * **Structural Analysis** is the process where the design patterns and structure of smart contracts are checked & verified.
    * Although we have a few automated testing tools for smart contract, I do not rely on them to a great extent. These tools are still at a very nascent stages and fails to keep with the rapidly evolving solidity language as well as new attack vectors that comes into picture every now and then.
    * Therefore, while this is a part of my audit procedure, its comparatively hard to detect high or medium severity issues in the step.
    * And this is exactly where **Manual Code Review**(*Step-3*) comes into picture.
3. **Manual Code Review** 👨🏼‍🏫
    * This is, comparatively,the most significant step in the entire audit procedure.
    * Manual code review basically involves an in-depth and line-by-line review of all the contracts under scope of audit.
    * The **intended behavior VS actual behaviour** of the smart contracts are closely observed at this stage. 
    * **Test cases** provided by the developers also play crucial role at this stage.These aren't just a mechanism to evaluate function executions but also helps in identifying the expectations from specific functions. 
    * Couple of imperative checkpoints/attack vectors  that are always evaluated during manual review are:
        * Access control set-up of the contract
        * External calls - Potential re-entrancy attacks 
        * Low level calls or delegate calls between contracts
        * Potential **sandwich attacks** or **flash loan attacks**
        * Inclusion of inadequate logic in smart contracts, etc
    * It should also be noted that manual reviews, quite often, follows an iterative procedure.
        * The initial review is mainly to ***identify and note the potential threats, bugs as well inadequate logic in the code, etc.*** 
        * However, the next iteration of reviews is more about ***creating POCs to prove the severity of the threat, communicate with developers on specific issues as well as wiping out the false positives***.
    * Additionally, manual code review doesn't just help in identifying security vulnerabilities but also helps in detecting *sections of the code that is inadequately optimized for gas usage*.
    * During manual review, I personally emphasize on 3 very specific type of smart contracts in the entire codebase, i.e., the contract either deals with:
        * Funds, token transfers or incentive mechanisms
        * Accessibility, or
        * Upgradeability
> **Note:** 
>*It does not indicate that only the above-mentioned > >contract types are reviewed during manual review.*
>
>*Instead, these are usually the kind of smart contracts that >have the higher probablity of including critical bugs.*
4. **Documentation of Preliminary Audit Report** 📝
    * Once the code is reviewed and issues are categorized on the basis of their severity, its time to clearly document them.
    * Preliminary audit reports specifically include detailed explanation of the issues found in the smart contract during the audit procedure.
    * To be very precise, my preliminary report includes 2 main sections for every issue that is detected:
        * **Explanation:** 
            * The first part is the detailed description of the issue in a very clear and understandable fashion.
            * This section includes all details about the line number as well the code snippets, if need be, to point the exact spot of the bug.
            * Most importantly, this section also clearly indicates the unintended consequences that the bug might have on the entire contract behavior. In some cases, a POC is attached as well to clearly explain the bug and its harmful effects.
        * **Recommendation:**
            * Along with the explanation, a recommendation section is also provided. 
            * This basically provides solutions or better modifications in the smart contract that could help minimize the repercussions of the bugs.
5. **Verifications of Code Fixes & Final Report Documentation** 🔎📝
    * Once the developers of the contract makes necessary changes in the smart contract based on the preliminary audit report, the final step of the audit is initiated.
    * In the last step, there are 2 critical aspects that I heavily emphaisize on:
        * **The code changes, based on initial report, should resolve all  high & medium severity bugs that were reported?**
        * **The code changes, based on initial report, should not include any additional vulnerability on the existing contract architecture?**
    * Once I have an adequate answer for both of these questions, I move on to prepare a final report that marks all the resolved bugs as **CLOSED**, indicating they are no longer a threat.
### Adequately documented audit reports are a boon for the community 👩‍👩‍👦‍👦
I firmly believe that audit reports is not just about communicating with technical developers about the vulnerabilities in their code.

It's also about including transparency between the product and the community which might not be technical enough to evaluate smart contract bugs. 

Properly documented audit reports helps the community be completely aware of the security aspects of the smart contracts which they might interact with and put their money in. Therefore, as a smart contract security auditor, its our job to provide a clear documentation and information on the security of the smart contract so the community can easily go through them and be capable enough to make their own call.

---
## Preferred Security Audit tools 🛠

1. **Static analysis tools:** 
These tools effectively help you identify any well-known smart contract bugs that you might have in your contract.
    * [Slither](https://github.com/crytic/slither)
    * [Mythril](https://github.com/ConsenSys/mythril)
    * [Mythx](https://mythx.io/). 

2. **Fuzz Testing tools:**
Such tools help identify potential exploit scenarios or contract execution failures by throwing random & unexpected data into your contract.
    * **[Echidna](https://github.com/crytic/echidna)**
    * **[Harvey](https://mariachris.github.io/Pubs/FSE-2020-Harvey.pdf)** 
3. **[Scribble](https://github.com/consensys/scribble)** which is an amazing runtime verification tool by [ConsenSys](https://medium.com/u/6c7078bf7b01?source=post_page-----4b3decc52b46--------------------------------) that allows you to annotate a solidity smart contract with crucial properties.
3. [**Surya**](https://github.com/ConsenSys/surya) (*Visualization tool*)While auditing complex & bulky smart contracts, the one thing you need the most is a visualization tool, and that’s exactly where Surya comes in.
It provides an incredibly simplified version of all crucial details about a contract’s structure including call graphs, inheritance graphs, etc.
4. **[VS Code visual auditor](https://marketplace.visualstudio.com/items?itemName=tintinweb.solidity-visual-auditor)** extension is an extremely helpful tool that provides security-oriented syntax as well as semantic highlighting and quite a few other tools that make the secure development of contracts easier.