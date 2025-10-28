// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MONCharacter.sol";

contract MONCharacterTest is Test {
    MONCharacter mon;
    address user = address(0xABCD);

    function setUp() public {
        mon = new MONCharacter();
        vm.deal(user, 10 ether); // 사용자에게 10 ETH 할당 (테스트용)
    }

    function testMintCharacter() public {
        vm.startPrank(user);
        uint256 tokenId = mon.mint(user, "ipfs://abc123.json");
        vm.stopPrank();

        assertEq(mon.ownerOf(tokenId), user);
        assertEq(mon.tokenURI(tokenId), "ipfs://abc123.json");
    }

    function testMintCharacterWithEmptyURI() public {
        vm.startPrank(user);
        vm.expectRevert(bytes("empty uri"));
        mon.mint(user, "");
        vm.stopPrank();
    }

    function testUpdateTokenURI() public {
        vm.startPrank(user);
        uint256 tokenId = mon.mint(user, "ipfs://abc123.json");
        mon.updateTokenURI(tokenId, "ipfs://22222.json");
        vm.stopPrank();
        assertEq(mon.ownerOf(tokenId), user);
        assertEq(mon.tokenURI(tokenId), "ipfs://22222.json");
    }

    function testUpdateTokenURIByNoneOwner() public {
        vm.startPrank(user);
        uint256 tokenId = mon.mint(user, "ipfs://abc123.json");
        vm.stopPrank();

        vm.prank(address(0xBEEF));
        vm.expectRevert(bytes("token is not exsisted"));
        mon.updateTokenURI(tokenId, "ipfs://22222.json");
    }
}
