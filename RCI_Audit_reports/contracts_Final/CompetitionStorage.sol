pragma solidity 0.8.4;

// SPDX-License-Identifier: MIT

import '../interfaces/IToken.sol';
import "./standard/utils/structs/EnumerableSet.sol";


/**
 * @title RCI Tournament(Competition) Contract
 * @author Rocket Capital Investment Pte Ltd
**/

contract CompetitionStorage {

    struct Information{
        bytes32 submission;
        uint256 staked;
        uint256 stakingRewards;
        uint256 challengeRewards;
        uint256 tournamentRewards;
        uint256 challengeScores;
        uint256 tournamentScores;
        mapping(uint256 => uint) info;
    }

    struct Challenge{
        bytes32 dataset;
        bytes32 results;
        bytes32 key;
        bytes32 privateKey;
        uint8 phase;
        mapping(address => Information) submitterInfo;
        mapping(uint256 => uint256) deadlines;
        EnumerableSet.AddressSet submitters;
    }

    IToken internal _token;
    uint32 internal _challengeCounter;
    uint256 internal _stakeThreshold;
    uint256 internal _competitionPool;
    uint256 internal _rewardsThreshold;
    uint256 internal _currentTotalStaked;
    uint256 internal _currentStakingRewardsBudget;
    uint256 internal _currentChallengeRewardsBudget;
    uint256 internal _currentTournamentRewardsBudget;
    uint256 internal _challengeRewardsPercentageInWei;
    uint256 internal _tournamentRewardsPercentageInWei;
    string internal _message;
    mapping(address => uint256) internal _stakes;
    mapping(uint32 => Challenge) internal _challenges;
}