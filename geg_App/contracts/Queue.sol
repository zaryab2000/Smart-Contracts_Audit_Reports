// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.16 <0.8.0;

/**
 * @title FIFO Queue for uint256 items
 * @notice Based on some examples from Internet
 */
contract Queue {
    mapping(uint256 => uint256) internal queue; // deposits
    uint256 internal first = 1;
    uint256 internal last;

    /**
     * @notice Put element at the end of queue
     * @param id could be any identifier from external contracts
     */
    function enqueue(uint256 id) public {
        // move cursor
        last += 1;
        // put element in map
        queue[last] = id;
    }

    /**
     * @notice Pop first element from queue
     * @return id as uint256
     */
    function dequeue() public returns (uint256 id) {
        require(last >= first, "queue is empty"); // non-empty queue

        id = queue[first];

        // clear map key
        delete queue[first];
        // move cursor
        first += 1;
    }

    /**
     * @notice Count elements in queue
     * @return Queue length
     */
    function length() public view returns (uint256) {
        return last >= first ? last - first + 1 : 0;
    }

    /**
     * @notice Read first queue element
     * @dev don't confuse with next() function of Python's iterators. This function doesn't change queue state
     * @return queue elemnt
     */
    function next() public view returns (uint256) {
        return queue[first];
    }
}
