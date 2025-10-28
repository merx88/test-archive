// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MONCharacter is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("MON Character", "MONCH") Ownable(msg.sender) {}

    event MintCharacter(address indexed to, uint256 indexed tokenId);
    event UpdateCharacterURI(uint256 indexed tokenId, string newURI);

    function mint(
        address to,
        string calldata metadataURI
    ) external returns (uint256 tokenId) {
        require(bytes(metadataURI).length != 0, "empty uri");
        tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        emit MintCharacter(to, tokenId);
    }

    function updateTokenURI(uint256 tokenId, string calldata newURI) external {
        require(_ownerOf(tokenId) != address(0), "token is not exsisted");
        require(ownerOf(tokenId) == msg.sender, "token is not exsisted");
        require(bytes(newURI).length != 0, "empty uri");

        _setTokenURI(tokenId, newURI);

        emit UpdateCharacterURI(tokenId, newURI);
    }
}
