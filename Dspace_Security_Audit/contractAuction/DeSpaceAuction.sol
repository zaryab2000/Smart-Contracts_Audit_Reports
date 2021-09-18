// SPDX-License-Identifier: MIT

//DES NFT auction contract 2021.7 */
//** Author: Henry Onyebuchi */

pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./DesLinkRegistryInterface.sol";

interface IDESNFT is IERC721 {
    /**
     * @dev Returns true if "addr" is an admin 
     */
    function isAdmin(address addr) external view returns (bool);

    /**
     * @dev Returns true if "addr" is a super admin 
     */
    function hasRole(bytes32 role, address addr) external view returns (bool);
}

contract DeSpaceAuction is ERC721Holder, Initializable {

    //state variables
    DesLinkRegistryInterface private registry;
    IDESNFT private nft;
    uint public initialBidAmount;
    uint public feePercentage; // 1% = 1000
    uint private DIVISOR;
    bool private deployed;
    address payable public feeReceipient;

    //struct
    struct Auction {
        address payable seller;
        address payable highestBidder;
        address payable admin;
        address compliantToken;
        uint highestBidAmount;
        uint endPeriod;
        uint bidCount;
    }

    //NFT address to token id to Auction struct
    mapping(uint => Auction) private auctions;

    //Events
    event AuctionUpdated(
        uint indexed _tokenId, 
        uint newEndPeriod
    );

    event AuctionCancelled(
        uint indexed tokenID
    );

    event AuctionResulted(
        address indexed highestBidder, 
        uint indexed tokenId, 
        uint highestBidAmount
    );

    event NewAuction(
        uint indexed tokenId,
        uint price,
        uint endPeriod,
        address indexed seller
    );

    event NewBid(
        address indexed bidder,
        uint indexed tokenId,
        address indexed paymentToken,
        uint price
    );

    event FeePercentageSet(
        address indexed sender, 
        uint feePercentage
    );

    event FeeReceipientSet(
        address indexed sender, 
        address feeReceipient
    );

    event RegistrySet(
        address indexed sender, 
        address registry
    );

    //Deployer
    function initialize(
        address _nft,
        address _registryAddress,
        address _feeReceipient, 
        uint _fee
        ) external initializer {
        
        require(
            !deployed,
            "Error: contract has already been initialized"
        );
        
        _setRegistry(_registryAddress);  
        _setFeeReceipient(_feeReceipient);
        _setFeePercentage(_fee);

        nft = IDESNFT(_nft);

        deployed = true;
        initialBidAmount = 1 ether;
        DIVISOR = 100 * 1000;
    }

    //Modifier to check all conditions are met before bid
    modifier bidConditions(uint _tokenId) {
        
        Auction memory auction = auctions[_tokenId];
        uint endPeriod = auction.endPeriod;
        
        require(
            auction.seller != msg.sender, 
            "Error: cannot bid own auction"
        ); 
        require(
            !nft.isAdmin(msg.sender), 
            "Error: admin cannot bid auction"
        ); 
        require(
            endPeriod != 0, 
            "Error: auction does not exist"
        );
        require(
            endPeriod > block.timestamp, 
            "Error: auction has ended"
        );
        
        _;
    }

    //modifier for only super admin call
    modifier onlySuperAdmin() {

        //as hashed in the NFT contract
        bytes32 role;
        
        require(
            nft.hasRole(role, msg.sender),
            "Error: only super admin can call"
        );

        _;
    }


    ///-----------------///
    /// WRITE FUNCTIONS ///
    ///-----------------///


    /* 
     * @dev check creates a new auction for an existing token.
     * @dev only NFT admin can create a new auction.
     * -------------------------------------------------------
     * errors if auction already exists.
     * ---------------------------------
     * @param _artist --> the artist/seller of the NFT.
     * @param _tokenId --> the id of the NFT.
     * -----------------------------------------
     * returns true if sussessfully created.
     */
    function createAuction(
        address _artist,
        uint _tokenId
        ) external returns(bool created) {
        
        require(
            nft.isAdmin(msg.sender),
            "Error: only NFT admin can call"
        );

        require(
            !nft.isAdmin(_artist),
            "Error: admin cannot be seller"
        );

        Auction storage auction = auctions[_tokenId];
        
        require(
            auction.seller == address(0), 
            "Error: auction already exist"
        ); 
        
        //collect NFT from sender
        nft.safeTransferFrom(msg.sender, address(this), _tokenId);
        
        //create auction
        uint period = block.timestamp + 1 days;
        auction.endPeriod = period;
        auction.seller = payable(_artist); 
        auction.admin = payable(msg.sender); 
        
        emit NewAuction(
            _tokenId, 
            initialBidAmount, 
            period, 
            _artist
        );

        return true;
    }

    /* 
     * @dev bids for an existing auction with ETH.
     * -------------------------------------------
     * errors if auction seller bids.
     * errors if auction does not exist.
     * errors if auction period is over.
     * if first bid, must send 1 ether.
     * if not first bid, previous bid must have been in ETH
     * if not first bid, must send 10% of previous bid in ETH. See { nextBidAmount }
     * if auction period is less than 1 hour, increases period by 10 minutes.
     * caps increased period to 1 hour.
     * -----------------------------------------------------------------------------
     * @param _tokenId --> the id of the NFT.
     * -----------------------------------------
     * returns back ether to the previous bidder.
     * returns true if sussessfully bidded.
     */
    function bidWithEther(
        uint _tokenId
        ) external payable 
        bidConditions(_tokenId) returns(bool bidded) {
        
        Auction storage auction = auctions[_tokenId];
        
        if(auction.bidCount == 0) { 
            require(
                msg.value == initialBidAmount, 
                "Error: must start bid with 1 ether"
            );
        } else {
            require(
                auction.compliantToken == address(0),
                "Error: must pay with compliant token"
            );
            uint amount = _nextBidAmount(_tokenId);
            require(
                msg.value == amount, 
                "Error: must bid 10 percent more than previous bid"
            );
            //return ether to the prevous highest bidder
            auction.highestBidder.transfer(auction.highestBidAmount);
        }

        //update data
        auction.highestBidder = payable(msg.sender);
        auction.highestBidAmount = msg.value; 
        auction.bidCount++;

        emit NewBid(
            msg.sender,
            _tokenId, 
            address(0),  
            msg.value
        );

        //increase countdown clock
        uint timeLeft = _bidTimeRemaining(_tokenId);
        if(timeLeft < 1 hours) {
            timeLeft + 10 minutes <= 1 hours 
            ? auction.endPeriod += 10 minutes 
            : auction.endPeriod += 1 hours - timeLeft;
            
            emit AuctionUpdated(
                _tokenId, 
                block.timestamp + _bidTimeRemaining(_tokenId)
            );
        }

        return true;
    }

    /* 
     * @dev bids for an existing auction with compliant token(s).
     * @dev must approve contract for { nextBidAmountToken }.
     * -----------------------------------------------------
     * errors if auction seller bids.
     * errors if auction does not exist.
     * errors if auction period is over.
     * if first bid, must send { nextBidAmountToken }.
     * if not first bid, previous bid must have been in _compliantToken
     * if not first bid, must send 10% of previous bid.
     * if auction period is less than 1 hour, increases period by 10 minutes.
     * caps increased period to 1 hour.
     * ----------------------------------------------------------------------
     * @param _tokenId --> the id of the NFT.
     * @param _compliantToken --> payment token (must be compliant from Registry).
     * @param _bidAmount --> the amount of compliant token to bid with. Should be 
     * determined using the nextBidAmountToken(_token, _tokenId, _compliantToken)
     * function which returns the amount to bid with
     * ---------------------------------------------------------------------------
     * returns back _compliantToken to the previous bidder. 
     * returns true if sussessfully bidded.
     */
    function bidWithToken(
        uint _tokenId,
        address _compliantToken,
        uint _bidAmount
        ) external bidConditions(_tokenId) returns(bool bidded) {
        
        Auction storage auction = auctions[_tokenId];

        require(
            _bidAmount > 0 &&
            _bidAmount == _nextBidAmountToken(
                _tokenId, 
                _compliantToken
            ),
            "Error: must bid with valid input. see nextBidAmountToken."
        );

        if(auction.bidCount == 0) {
            IERC20(_compliantToken).transferFrom(
                msg.sender, address(this), _bidAmount
            );
            auction.compliantToken = _compliantToken;
        } else {
            if (auction.compliantToken == address(0)) {
                revert("Payment should be in ether");
            } else {
                require(
                    auction.compliantToken == _compliantToken, 
                    "Error: must pay with compliant token"
                );
            }
            
            IERC20(_compliantToken).transferFrom(
                msg.sender, address(this), _bidAmount
            );

            //return token to the prevous highest bidder
            IERC20(_compliantToken).transfer(
                auction.highestBidder, auction.highestBidAmount
            );
        }

        //update data
        auction.highestBidder = payable(msg.sender);
        auction.highestBidAmount = _bidAmount; 
        auction.bidCount++;

        emit NewBid(
            msg.sender, 
            _tokenId,
            _compliantToken, 
            _bidAmount
        );

        //increase countdown clock
        uint timeLeft = _bidTimeRemaining(_tokenId);
        if(timeLeft < 1 hours) {
            timeLeft + 10 minutes <= 1 hours 
            ? auction.endPeriod += 10 minutes 
            : auction.endPeriod += (1 hours - timeLeft);
            
            emit AuctionUpdated(
                _tokenId, 
                block.timestamp + _bidTimeRemaining(_tokenId)
            );
        }

        return true;
    }

    /* 
     * @dev bids for an existing auction.
     * @dev only NFT super admin or auction creator can execute.
     * ---------------------------------------------------------
     * errors if auction does not exist.
     * errors if auction period is not over.
     * -------------------------------------
     * @param _tokenId --> the id of the NFT.
     * --------------------------------------
     * returns true if sussessfully bidded.
     * returns back NFT to the seller if auction is unseccessful.
     * if successfull, collects fee, pays selle and transfers NFT to highest bidder
     */
    function closeBid(
        uint _tokenId
        ) external returns(bool closed) {

        Auction storage auction = auctions[_tokenId];

        //as hashed in the DeSpace NFT contract
        bytes32 role;

        require(
            nft.hasRole(role, msg.sender)
            || auction.admin == msg.sender,
            "Error: only super admin or auction creator"
        );
        
        require(
            auction.seller != address(0), 
            "Error: auction does not exist"
        );
        
        uint timeLeft = _bidTimeRemaining(_tokenId);
        require(
            timeLeft == 0, 
            "Error: auction has not ended"
        );
        
        uint highestBidAmount = auction.highestBidAmount;
        address highestBidder = auction.highestBidder;

        if (highestBidAmount == 0) {
            //auction failed, no bidding occured
            nft.transferFrom(
                address(this), auction.admin, _tokenId
            );
            emit AuctionCancelled(_tokenId);
        
        } else {
            //auction succeeded, pay fee, send money to seller, and token to buyer
            uint fee = (feePercentage * highestBidAmount) / DIVISOR;
            if (auction.compliantToken != address(0)) {
                address compliantToken = auction.compliantToken;
                IERC20(compliantToken).transfer(
                    feeReceipient, fee
                );
                IERC20(compliantToken).transfer(
                    auction.seller, highestBidAmount - fee
                );
            } else {
                feeReceipient.transfer(fee);
                auction.seller.transfer(highestBidAmount - fee);
            }
            
            nft.transferFrom(
                address(this), highestBidder, _tokenId
            );

            emit AuctionResulted(
                highestBidder, _tokenId, highestBidAmount
            );
        }
        
        delete auctions[_tokenId];
        return true;
    }

    
    ///-----------------///
    /// ADMIN FUNCTIONS ///
    ///-----------------///


    /* 
     * @dev sets the fee percentage (only NFT super admin).
     * @dev 1 percent equals 1000
     * ------------------------------------------
     * errors if new value already exists.
     * -----------------------------------
     * @param _newFeePercentage --> the new fee percentage.
     * ----------------------------------------------------
     * returns whether successfully set or not.
     */ 
    function setFeePercentage(
        uint _newFeePercentage
        ) external onlySuperAdmin() returns(bool feePercentageSet) {
        
        _setFeePercentage(_newFeePercentage);
        
        emit FeePercentageSet(msg.sender, _newFeePercentage);
        return true;
    }

    /* 
     * @dev sets the fee receipient (only NFT super admin).
     * ----------------------------------------------------
     * errors if new receipient already exists.
     * ----------------------------------------
     * @param _newFeeReceipient --> the new fee receipient.
     * ----------------------------------------------------
     * returns whether successfully set or not.
     */ 
    function setFeeReceipient(
        address _newFeeReceipient
        ) external onlySuperAdmin() returns(bool feeReceipientSet) {
        
        _setFeeReceipient(_newFeeReceipient);
        
        emit FeeReceipientSet(msg.sender, _newFeeReceipient);
        return true;
    }

    /* 
     * @dev sets the registry pointer (only NFT super admin).
     * ------------------------------------------------------
     * errors if new registry already exists.
     * --------------------------------------
     * @param _newRegistry --> the new registry address.
     * -------------------------------------------------
     * returns whether successfully set or not.
     */ 
    function setRegistry(
        address _newRegistry
        ) external onlySuperAdmin() returns(bool registrySet) {
        
        _setRegistry(_newRegistry);
        
        emit RegistrySet(msg.sender, _newRegistry);
        return true;
    }


    ///-----------------///
    /// READ FUNCTIONS ///
    ///-----------------///


    /* 
     * @dev get the seconds left for an auction to end.
     * ------------------------------------------------
     * @param _token --> the address of the NFT.
     * @param _tokenId --> the id of the NFT.
     * ---------------------------------------
     * returns the remaining seconds.
     */  
    function bidTimeRemaining( 
        uint _tokenId
        ) external view returns(uint secondsLeft) {
        
        return _bidTimeRemaining(_tokenId);
    }

    /* 
     * @dev get the next viable amount to make bid.
     * --------------------------------------------
     * @param _token --> the address of the NFT.
     * @param _tokenId --> the id of the NFT.
     * ---------------------------------------
     * returns the amount in wei.
     * returns 0 for invalid auction or if initial bid wasn't in ether
     */
    function nextBidAmount(
        uint _tokenId
        ) external view returns(uint amount) {
        
        return _nextBidAmount(_tokenId);
    }

    /* 
     * @dev get the next viable amount to make bid in compliant token.
     * ---------------------------------------------------------------
     * @param _token --> the address of the NFT.
     * @param _tokenId --> the id of the NFT.
     * @param _compliantToken --> the token to check for.
     * --------------------------------------------------
     * returns the amount.
     * returns 0 if invalid auction or if initial bid was made in another asset
     * returns 1 ether equivilent in _compliantToken if first bid
     * returns 10 percent more of previous bid if not initial
     */
    function nextBidAmountToken(
        uint _tokenId,
        address _compliantToken
        ) external view returns(uint amount) {
        
        return _nextBidAmountToken(
            _tokenId, _compliantToken);
    }

    /**
     * @dev get the price from chainlink.
     * ----------------------------------
     * @param _compliantToken --> the token to check the price in ether
     * ----------------------------------------------------------------
     * returns the latest price
     * returns 0 if not compliant
     */
    function getThePrice(
        address _compliantToken
        ) external view returns(uint price_per_ETH) {
        
        return _getThePrice(_compliantToken);
    }

    /**
     * @dev get the contract address of DesLinkRegistry.
     * -------------------------------------------------
     * returns the contract address of DesLinkRegistry.
     */
    function getRegistry(
        ) external view returns(address registry_) {
        
        return address(registry);
    }

    /**
     * @dev get the struct details of an auction.
     * ------------------------------------------
     * returns the struct details of an auction.
     */
    function getAuction(
        uint _tokenId
        ) external view returns(Auction memory) {
        
        return auctions[_tokenId];
    }

    
    ///-----------------///
    /// PRIVATE FUNCTIONS ///
    ///-----------------///


    /* 
     * @dev get the seconds left for an auction to end.
     * ------------------------------------------------
     * @param _token --> the address of the NFT.
     * @param _tokenId --> the id of the NFT.
     * ---------------------------------------
     * returns the remaining seconds.
     * returns 0 if auction isn't open.
     */
    function _bidTimeRemaining(
        uint _tokenId
        ) private view returns(uint secondsLeft) {
        
        uint endPeriod = auctions[_tokenId].endPeriod;

        if(endPeriod > block.timestamp) 
        return endPeriod - block.timestamp;
        return 0;
    }

    /* 
     * @dev get the next viable amount to make bid.
     * --------------------------------------------
     * @param _token --> the address of the NFT.
     * @param _tokenId --> the id of the NFT.
     * ---------------------------------------
     * returns the amount in wei.
     * returns 0 if invalid auction
     * returns 1 ether if first bid
     * returns 10 percent more of previous bid
     */
    function _nextBidAmount(
        uint _tokenId
        ) private view returns(uint amount) {
        
        address seller = auctions[_tokenId].seller;
        if (
            seller != address(0) && 
            auctions[_tokenId].compliantToken == address(0)
        ) {
            uint count = auctions[_tokenId].bidCount;
            uint current = auctions[_tokenId].highestBidAmount;
            if(count == 0) return 1 ether;
            //10% of current highest bid
            else return ((current * 10000) / DIVISOR) + current;
        }
        return 0;
    }

    /* 
     * @dev get the next viable amount to make bid in compliant token.
     * ---------------------------------------------------------------
     * @param _token --> the address of the NFT.
     * @param _tokenId --> the id of the NFT.
     * @param _compliantToken --> the token to check for.
     * --------------------------------------------------
     * returns the amount.
     * returns 0 if invalid auction or if initial bid was made in another asset
     * returns 1 ether equivilent in _compliantToken if first bid
     * returns 10 percent more of previous bid if not initial
     */
    function _nextBidAmountToken(
        uint _tokenId,
        address _compliantToken
        ) private view returns(uint amount) {
        
        Auction memory auction = auctions[_tokenId];
        if (auction.seller != address(0)) {
            uint current = auction.highestBidAmount; 
            
            if (current == 0) {
                (,uint8 decimals) = registry.getProxy(_compliantToken);
                uint ethPerToken = _getThePrice(_compliantToken);
                return (
                //get the equivilent based on chainlink oracle price and token decimal
                    ((10 ** uint(decimals)) * initialBidAmount) / ethPerToken
                );
            } else {
                if (auction.compliantToken == _compliantToken) {
                    //10% of current highest bid
                    return ((current * 10000) / DIVISOR) + current;
                } else {
                    return 0;
                }
            }
        }
        return 0;
    }

    /**
     * @dev get the price from chainlink.
     * ----------------------------------
     * @param _compliantToken --> the token to check the price in ether
     * ----------------------------------------------------------------
     * returns the latest price
     * returns 0 if not compliant
     */
    function _getThePrice(
        address _compliantToken
        ) private view returns(uint) {

        //get chainlink proxy from DesLinkRegistry
        (address chainlinkProxy,) = registry.getProxy(_compliantToken);
        
        if(chainlinkProxy != address(0)) { 
            (,int price,,,) = AggregatorV3Interface(
                chainlinkProxy).latestRoundData();
            return uint(price);
        }
        return 0;
    }

    /* 
     * @dev sets the fee percentage (only owner).
     * ------------------------------------------
     * errors if new value already exists.
     * -----------------------------------
     * @param _newFeePercentage --> the new fee percentage.
     * ----------------------------------------------------
     * returns whether successfully set or not.
     */ 
    function _setFeePercentage(
        uint _newFee
        ) private {
        require(_newFee != feePercentage, "Error: already set");
        feePercentage = _newFee;
    }

    /* 
     * @dev sets the fee receipient (only owner).
     * ------------------------------------------
     * errors if new receipient already exists.
     * ----------------------------------------
     * @param _newFeeReceipient --> the new fee receipient.
     * ----------------------------------------------------
     * returns whether successfully set or not.
     */ 
    function _setFeeReceipient(
        address _newFeeReceipient
        ) private {
        require(_newFeeReceipient != feeReceipient, "Error: already receipient");
        feeReceipient = payable(_newFeeReceipient);
    }

    /* 
     * @dev sets the registry pointer (only owner).
     * --------------------------------------------
     * errors if new pointer already exists.
     * -------------------------------------
     * @param _newRegistry --> the new registry pointer.
     */ 
    function _setRegistry(
        address _newRegistry
        ) private {
        require(_newRegistry != address(registry), "Error: already registry");
        registry = DesLinkRegistryInterface(_newRegistry);
    }
}