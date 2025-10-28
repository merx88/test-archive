// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MONCharacterVault is Ownable, ReentrancyGuard {
    IERC721 public immutable monCharacter;

    mapping(uint256 tokenId => uint256 balance) public balances;

    address public colosseum;

    constructor(address _monCharacter) Ownable(msg.sender) {
        require(_monCharacter != address(0), "Invalid NFT addresss");
        monCharacter = IERC721(_monCharacter);
    }

    function deposit(uint256 tokenId) external payable nonReentrant {
        require(msg.value > 0, "No value");
        require(monCharacter.ownerOf(tokenId) == msg.sender, "Not owner");

        balances[tokenId] += msg.value;
    }

    function withdraw(uint256 tokenId, uint256 amount) external nonReentrant {
        require(monCharacter.ownerOf(tokenId) == msg.sender, "Not owner");
        require(balances[tokenId] >= amount, "Insufficient");
        balances[tokenId] -= amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");
    }

    function balanceOf(
        uint256 tokenId
    ) external view returns (uint256 balance) {
        return balances[tokenId];
    }
}
