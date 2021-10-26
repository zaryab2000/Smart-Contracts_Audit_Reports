pragma solidity 0.8.4;

// SPDX-License-Identifier: MIT

import './AccessControlRci.sol';
import './../interfaces/IRegistry.sol';


contract Registry is AccessControlRci, IRegistry{
    struct Comp{
        bool active;
        address competitionAddress;
        bytes32 rulesLocation;
    }

    struct Ext{
        bool active;
        address extensionAddress;
        bytes32 informationLocation;
    }
    address private _token;
    mapping(string => Comp) private _competition;
    mapping(string => Ext) private _extension;
    string[] private _competitionNames;
    string[] private _extensionNames;


    constructor()
    {
        _initializeRciAdmin();
    }

    function registerNewCompetition(string calldata competitionName, address competitionAddress, bytes32 rulesLocation)
    external override onlyAdmin
    {
        require(_competition[competitionName].competitionAddress == address(0), "Registry - registerNewCompetition: Competition already exists.");
        _competition[competitionName] = Comp({active:true, competitionAddress:competitionAddress, rulesLocation:rulesLocation});
        _competitionNames.push(competitionName);

        emit NewCompetitionRegistered(competitionName, competitionAddress, rulesLocation);
    }

    function toggleCompetitionActive(string calldata competitionName)
    external override onlyAdmin
    {
        require(_competition[competitionName].competitionAddress != address(0), "Registry - toggleCompetitionActive: Competition does not exist. Use function 'registerNewCompetition' instead.");
        _competition[competitionName].active = !_competition[competitionName].active;

        emit CompetitionActiveToggled(competitionName);
    }

    function changeCompetitionRulesLocation(string calldata competitionName, bytes32 newLocation)
    external override onlyAdmin
    {
        require(_competition[competitionName].competitionAddress != address(0), "Registry - changeCompetitionRulesLocation: Competition does not exist. Use function 'registerNewCompetition' instead.");
        require(newLocation != bytes32(0), "Registry - changeCompetitionRulesLocation: Cannot set to 0 address.");
        _competition[competitionName].rulesLocation = newLocation;

        emit CompetitionRulesLocationChanged(competitionName, newLocation);
    }

    function changeTokenAddress(address newAddress)
    external override onlyAdmin
    {
        require(newAddress != address(0), "Registry - changeTokenAddress: Cannot set to 0 address.");
        _token = newAddress;

        emit TokenAddressChanged(newAddress);
    }

    function registerNewExtension(string calldata extensionName,address extensionAddress, bytes32 informationLocation)
    external override onlyAdmin
    {
        require(_extension[extensionName].extensionAddress == address(0), "Registry - registerNewExtension: Extension already exists.");
        _extension[extensionName] = Ext({active:true, extensionAddress:extensionAddress, informationLocation:informationLocation});
        _extensionNames.push(extensionName);

        emit NewExtensionRegistered(extensionName, extensionAddress, informationLocation);
    }
    
    function toggleExtensionActive(string calldata extensionName)
    external override onlyAdmin
    {
        require(_extension[extensionName].extensionAddress != address(0), "Registry - toggleExtensionActive: Extension does not exist. Use function 'registerNewExtension' instead.");
        _extension[extensionName].active = !_extension[extensionName].active;

        emit ExtensionActiveToggled(extensionName);
    }
    
    function changeExtensionInfoLocation(string calldata extensionName, bytes32 newLocation)
    external override onlyAdmin
    {
        require(_extension[extensionName].extensionAddress != address(0), "Registry - changeExtensionInfoLocation: Competition does not exist. Use function 'registerNewCompetition' instead.");
        require(newLocation != bytes32(0), "Registry - changeExtensionInfoLocation: Cannot set to 0 address.");
        _extension[extensionName].informationLocation = newLocation;

        emit ExtensionInfoLocationChanged(extensionName, newLocation);
    }

    // convenience function for DAPP.
    function batchCall(address[] calldata addresses, bytes[] calldata data)
    external view
    returns (bytes[] memory)
    {
        bytes[] memory returnDataList = new bytes[](data.length);
        for (uint i = 0; i < data.length; i++){
            (bool success, bytes memory returnedData) = addresses[i].staticcall(data[i]);
            returnDataList[i] = returnedData;
        }
        return returnDataList;
    }

    /* READ METHODS */

    function getCompetitionList()
    view external override
    returns (string[] memory competitionNames)
    {
        competitionNames = _competitionNames;
    }

    function getExtensionList()
    view external override
    returns (string[] memory extensionNames)
    {
        extensionNames = _extensionNames;
    }

    function getCompetitionActive(string calldata competitionName)
    view external override
    returns (bool active)
    {
        active = _competition[competitionName].active;
    }

    function getCompetitionAddress(string calldata competitionName)
    view external override
    returns (address competitionAddress)
    {
        competitionAddress = _competition[competitionName].competitionAddress;
    }

    function getCompetitionRulesLocation(string calldata competitionName)
    view external override
    returns (bytes32 rulesLocation)
    {
        rulesLocation = _competition[competitionName].rulesLocation;
    }

    function getTokenAddress()
    view external override
    returns (address token)
    {
        token = _token;
    }

    function getExtensionAddress(string calldata extensionName)
    view external override
    returns (address extensionAddress)
    {
        extensionAddress = _extension[extensionName].extensionAddress;
    }

    function getExtensionActive(string calldata extensionName)
    view external override
    returns (bool active)
    {
        active = _extension[extensionName].active;
    }

    function getExtensionInfoLocation(string calldata extensionName)
    view external override
    returns (bytes32 informationLocation)
    {
        informationLocation = _extension[extensionName].informationLocation;
    }
}





