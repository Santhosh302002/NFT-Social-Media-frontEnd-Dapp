//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SocialNetworkDapp is ERC721URIStorage {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address immutable i_owner;
    uint256 public immutable NFTlistingFee=10;
    struct TotalNFT{
        address tokenOwner;
        uint256 tokenId;
        string tokenURL;
        uint256 tokenPrice;
    }
    TotalNFT[] public ListedNFT;

    struct UserNFT{
        uint256 tokenId;
        uint256 tokenPrice;
        string tokenURL;
    }
    UserNFT[] public allUserNFT;

    struct tokenDetails{
        address payable owner;
        string tokenURL;
        uint256 price;
    }
    struct comments{
        string comment;
    }
    comments[] public COMMENT;
    mapping(uint256 => comments[]) public commenting;

    mapping(address =>UserNFT[]) public UserNFTDetails;
    mapping(uint256 => tokenDetails) public tokenBuyDetails;
    

    constructor() ERC721("NFTpic", "NFTP") {
        i_owner = payable(msg.sender);
    }

    function createTokenNFT(string memory tokenURI,uint256 price) public payable returns (uint){
        payable(address(this)).send(NFTlistingFee);
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        ListedNFT.push(
            TotalNFT(
                msg.sender,
                newTokenId,
                tokenURI,
                price
            )
        );
        // allUserNFT.push(UserNFT(newTokenId,price,tokenURI));
        UserNFTDetails[msg.sender].push(UserNFT(newTokenId,price,tokenURI));
        tokenBuyDetails[newTokenId]=tokenDetails(payable(msg.sender),tokenURI,price);
        COMMENT.push(comments(""));
        commenting[newTokenId]=COMMENT;
        return newTokenId;
    }

      function getAllNFT() public view returns(address[] memory,uint256[] memory,string[] memory,uint256[] memory) {
        address[]  memory tokenOwners = new address[](_tokenIds.current());
        uint256[] memory tokenIds= new uint256[](_tokenIds.current());
        string[]  memory tokenURLs = new string[](_tokenIds.current());
        uint256[]  memory tokenPrices = new uint256[](_tokenIds.current());
    for (uint256 i = 0; i < _tokenIds.current(); i++) {
          TotalNFT storage list= ListedNFT[i];
          tokenOwners[i] = list.tokenOwner;
          tokenIds[i] = list.tokenId;
          tokenURLs[i] = list.tokenURL;
          tokenPrices[i]=list.tokenPrice;
    }
      return(tokenOwners,tokenIds,tokenURLs,tokenPrices);
    }

    function getMyNFT() public view returns(UserNFT[] memory){
        return UserNFTDetails[msg.sender];
    }


    function getNFTListingFee() public view returns(uint256){
        return NFTlistingFee;
    }
    function nftTokenId() public view returns(uint256){
        return _tokenIds.current();
    }

    function BuyNFT(uint256 tokenId) public payable{
        _tokenIds.increment();
        uint256 newTokenID=_tokenIds.current();
        _safeMint(msg.sender, newTokenID);
        _setTokenURI(newTokenID, tokenBuyDetails[tokenId].tokenURL);
        payable(tokenBuyDetails[tokenId].owner).transfer(tokenBuyDetails[tokenId].price);
        _tokenIds.increment();
    }

    function enterComment(uint256 tokenId,string memory comment) public{
        commenting[tokenId].push(comments(comment));
    }
    function viewComment(uint256 tokenId) public view returns(comments[] memory){
        return commenting[tokenId];
    }
}
