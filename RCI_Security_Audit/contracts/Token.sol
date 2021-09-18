pragma solidity 0.8.4;

// SPDX-License-Identifier: MIT

import "./standard/token/ERC20/presets/ERC20PresetFixedSupply.sol";
import "./standard/access/AccessControl.sol";
import "./../interfaces/ICompetition.sol";

contract Token is ERC20PresetFixedSupply, AccessControl
{
//    mapping (address => mapping (address => bool)) private _permissions;

//    event PermissionGranted(address indexed owner, address indexed spender);
//    event PermissionRevoked(address indexed owner, address indexed spender);
    event CompetitionAuthorized(address indexed competitionAddress);
    event CompetitionRevoked(address indexed competitionAddress);

    mapping (address => bool) private _authorizedCompetitions;

    constructor(string memory name_, string memory symbol_, uint256 initialSupply_)
    ERC20PresetFixedSupply(name_, symbol_, initialSupply_, msg.sender)
    {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

//    function grantPermission(address spender)
//    public
//    returns (bool success)
//    {
//        require(!_permissions[msg.sender][spender], "Permission already granted.");
//        _permissions[msg.sender][spender] = true;
//        ERC20.approve(spender, 0);
//        success = true;
//        emit PermissionGranted(msg.sender, spender);
//    }
//
//    function revokePermission(address spender)
//    public
//    returns (bool success)
//    {
//        require(_permissions[msg.sender][spender], "Permission already revoked.");
//        _permissions[msg.sender][spender] = false;
//        success = true;
//        emit PermissionRevoked(msg.sender, spender);
//    }
//
//    function getPermission(address permitter, address permittee)
//    public view
//    returns (bool permitted)
//    {
//        permitted = _permissions[permitter][permittee];
//    }

//    function transferFrom(address sender, address recipient, uint256 amount)
//    public override
//    returns (bool success)
//    {
//        if (!_permissions[sender][msg.sender]){
//            ERC20.transferFrom(sender, recipient, amount);
//        } else{
//            ERC20._transfer(sender, recipient, amount);
//        }
//        success = true;
//    }

//    function approve(address spender, uint256 amount)
//    public override
//    returns (bool success)
//    {
//        require(!_permissions[msg.sender][spender], "Permission is already granted. If you wish to specify an allowance, please revoke the permission first.");
//        success = ERC20.approve(spender, amount);
//    }

//    function increaseAllowance(address spender, uint256 addedValue)
//    public override
//    returns (bool success)
//    {
//        require(!_permissions[msg.sender][spender], "Permission is already granted. If you wish to specify an allowance, please revoke the permission first.");
//        success = ERC20.increaseAllowance(spender, addedValue);
//    }

//    function getSender(address target)
//    external view
//    returns(address, address)
//    {
//        return ICompetition(target).getSender();
//    }

    function increaseStake(address target, uint256 amountToken)
    public
    returns (bool success)
    {
        require(_authorizedCompetitions[target], "Token - increaseStake: This competition is not authorized.");
        uint256 senderBal = _balances[msg.sender];
        uint256 senderStake = ICompetition(target).getStake(msg.sender);

        ICompetition(target).increaseStake(msg.sender, amountToken);
        transfer(target, amountToken);

        require((senderBal - _balances[msg.sender]) == amountToken, "Token - increaseStake: Sender final balance incorrect.");
        require((ICompetition(target).getStake(msg.sender) - senderStake) == amountToken, "Token - increaseStake: Sender final stake incorrect.");

        success = true;
    }

    function decreaseStake(address target, uint256 amountToken)
    public
    returns (bool success)
    {
        require(_authorizedCompetitions[target], "Token - decreaseStake: This competition is not authorized.");
        uint256 senderBal = _balances[msg.sender];
        uint256 senderStake = ICompetition(target).getStake(msg.sender);

        ICompetition(target).decreaseStake(msg.sender, amountToken);

        require((_balances[msg.sender] - senderBal) == amountToken, "Token - decreaseStake: Sender final balance incorrect.");
        require(senderStake - (ICompetition(target).getStake(msg.sender)) == amountToken, "Token - decreaseStake: Sender final stake incorrect.");

        success = true;
    }

    function setStake(address target, uint256 amountToken)
    external
    returns (bool success)
    {
        require(_authorizedCompetitions[target], "Token - setStake: This competition is not authorized.");
        uint256 currentStake = ICompetition(target).getStake(msg.sender);
        require(currentStake != amountToken, "Token - setStake: Your stake is already set to this amount.");
        if (amountToken > currentStake){
            increaseStake(target, amountToken - currentStake);
        } else{
            decreaseStake(target, currentStake - amountToken);
        }
        success = true;
    }

    function getStake(address target, address staker)
    external view
    returns (uint256 stake)
    {
        stake = ICompetition(target).getStake(staker);
    }


    function authorizeCompetition(address competitionAddress)
    external
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Token - authorizeCompetition: Caller is unauthorized.");
        _authorizedCompetitions[competitionAddress] = true;

        emit CompetitionAuthorized(competitionAddress);
    }

    function revokeCompetition(address competitionAddress)
    external
    {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Token - revokeCompetition: Caller is unauthorized.");
        _authorizedCompetitions[competitionAddress] = false;

        emit CompetitionRevoked(competitionAddress);
    }

    function competitionIsAuthorized(address competitionAddress)
    external view
    returns (bool authorized)
    {
        authorized = _authorizedCompetitions[competitionAddress];
    }
}