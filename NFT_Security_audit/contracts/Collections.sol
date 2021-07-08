// SPDX-License-Identifier: MIT
// Latest stable version of solidity
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ERC1155.sol";
import "./Authorizable.sol";
import "./IFarm.sol";

enum PaymentTypes {BuyNowByErn, BuyNowByStone}

struct NFT {
    address seller;
    uint256 ern;
    uint256 discount;
    uint256 stone;
}

struct Winners {
    uint256 amount;
    bool transferred;
}

contract Collections is IERC1155Receiver, ERC1155, Ownable {
    event CardAdded(address, uint256, uint256);
    event WinnerAdded(address, PaymentTypes, uint256, uint256);
    event ShareAdded(uint256, uint256, uint256, uint256, uint256, uint256);
    event CardBought(address, uint256, PaymentTypes, uint256);
    event CardTransffered(address, PaymentTypes, uint256, uint256);

    mapping(uint256 => mapping(address => Winners)) private winners;
    mapping(address => uint256) private shares;
    /**
     * collection is nft struct mapping. One collection has several nft cards.
     */
    mapping(uint256 => NFT) public collection;
    mapping(bytes32 => uint256) private _ids;

    IFarm public farmContract;
    IERC20 public ernToken;

    address private _artist;
    address private _agent;
    address private _celebrity;
    address private _charityOne;
    address private _charityTwo;
    address private _toAddress;

    uint256 public quantity; // Equals to 0 at day 1;
    uint256 public sold; // Equals to 0 at day 1;

    constructor(string memory _uri, address toAddress) ERC1155(_uri) {
        _toAddress = toAddress;
    }

    function addShares(
        address artist,
        uint256 multiplierArtist,
        address celebrity,
        uint256 multiplierCelebrity,
        address agent,
        uint256 multiplierAgent,
        address charityOne,
        uint256 multiplierCharityOne,
        address charityTwo,
        uint256 multiplierCharityTwo,
        uint256 multiplierEthernity
    ) public {
        _artist = artist;
        _celebrity = celebrity;
        _agent = agent;
        _charityOne = charityOne;
        _charityTwo = charityTwo;

        shares[artist] = multiplierArtist;
        shares[celebrity] = multiplierCelebrity;
        shares[agent] = multiplierAgent;
        shares[address(this)] = multiplierEthernity;
        shares[charityOne] = multiplierCharityOne;
        shares[charityTwo] = multiplierCharityTwo;

        emit ShareAdded(
            multiplierArtist,
            multiplierCelebrity,
            multiplierAgent,
            multiplierCharityOne,
            multiplierCharityTwo,
            multiplierEthernity
        );
    }

    function addErnAddress(address ern) external onlyOwner {
        ernToken = IERC20(ern);
    }

    function addFarmContractAddress(address farm) external onlyOwner {
        farmContract = IFarm(farm);
    }

    function changeDiscount(uint256 id, uint256 _discount) external onlyOwner {
        collection[id].discount = _discount;
    }

    function cardTransfer(
        uint256 id,
        uint256 amount,
        address winner,
        PaymentTypes tp
    ) public {
        winners[id][winner].amount = amount;
        winners[id][winner].transferred = false;

        safeTransferFrom(msg.sender, address(this), id, 1, "");
        quantity += 1;

        emit WinnerAdded(winner, tp, amount, id);
        emit CardTransffered(winner, tp, amount, id);
    }

    function addCard(
        address seller,
        uint256 id,
        uint256 ern,
        uint256 stone,
        uint256 discount
    ) public onlyOwner {
        require(collection[id].seller == address(0), "Card id already exists");
        collection[id] = NFT(seller, ern, stone, discount);
        quantity += 1;
        _mint(address(this), id, 1, "");

        emit CardAdded(seller, id, ern);
    }

    function addCardBatch(
        address[] memory sellers,
        uint256[] memory ids,
        uint256[] memory erns,
        uint256[] memory stones,
        uint256[] memory discounts
    ) public onlyOwner {
        require(
            ids.length == sellers.length && ids.length == erns.length,
            "Cards aren't consistent!"
        );

        for (uint24 i = 0; i < ids.length; i++) {
            addCard(sellers[i], ids[i], erns[i], stones[i], discounts[i]);
        }
    }

    function approveTokens(uint256 amount) external {
        ernToken.approve(msg.sender, amount);
    }

    function buyByErn(uint256 id)
        external
        onlyCardPayable(id, PaymentTypes.BuyNowByErn)
    {
        uint256 amount = collection[id].ern;
        uint256 discount = collection[id].discount;
        uint256 discountAmount = (collection[id].ern / 100e18) * discount;
        amount = amount - discountAmount;
        distributeTokens(msg.sender, address(this), ernToken, amount);

        transferFrom(address(this), msg.sender, id, 1, "");

        sold += 1;

        emit CardBought(msg.sender, id, PaymentTypes.BuyNowByErn, amount);
    }

    function buyByStones(uint256 id)
        external
        onlyCardPayable(id, PaymentTypes.BuyNowByStone)
    {
        uint256 amount = collection[id].stone;
        farmContract.payment(msg.sender, amount);

        safeTransferFrom(address(this), msg.sender, id, 1, "");
        sold += 1;

        emit CardBought(msg.sender, id, PaymentTypes.BuyNowByStone, amount);
    }

    modifier onlyCardPayable(uint256 id, PaymentTypes paymentType) {
        require(quantity > 0, "Out of stock");

        if (paymentType == PaymentTypes.BuyNowByErn) {
            require(collection[id].ern > 0, "Card is not payable!");
        } else if (paymentType == PaymentTypes.BuyNowByStone) {
            require(collection[id].stone > 0, "Card is not payable!");
        }
        _;
    }

    function distributeTokens(
        address from,
        address to,
        IERC20 token,
        uint256 amount
    ) internal {
        // Check if transfer reverts due to 2300 gas limit.
        // We should change to call than.
        token.transferFrom(from, to, amount);
        token.transfer(_artist, amount * (shares[_artist] / 100));
        token.transfer(_celebrity, amount * (shares[_celebrity] / 100));
        token.transfer(_agent, amount * (shares[_agent] / 100));
        token.transfer(_charityOne, amount * (shares[_charityOne] / 100));
        token.transfer(_charityTwo, amount * (shares[_charityTwo] / 100));
        token.transfer(_toAddress, amount * (shares[_toAddress] / 100));
    }

    //////////////
    /// Override functions
    //////////////

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
