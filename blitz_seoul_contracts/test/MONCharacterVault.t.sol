// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/MONCharacter.sol";
import "../src/MONCharacterVault.sol";

contract MONCharacterVaultTest is Test {
    MONCharacter mon;
    MONCharacterVault vault;
    address user1 = address(0xABCD);
    address user2 = address(0xBBB2);

    function setUp() public {
        mon = new MONCharacter();
        vault = new MONCharacterVault(address(mon));
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
    }

    function testDeposit() public {
        vm.startPrank(user1);
        uint256 tokenId = mon.mint(user1, "ipfs://user1.json");
        vault.deposit{value: 1 ether}(tokenId);
        vm.stopPrank();

        assertEq(vault.balanceOf(tokenId), 1 ether);
    }

    function testDepositWithNoValue() public {
        vm.startPrank(user1);
        uint256 tokenId = mon.mint(user1, "ipfs://user1.json");
        vm.expectRevert(bytes("No value"));
        vault.deposit{value: 0 ether}(tokenId);
        vm.stopPrank();
    }

    function testDepositWithNotOwner() public {
        vm.startPrank(user1);
        uint256 tokenId1 = mon.mint(user1, "ipfs://user1.json");
        vm.stopPrank();
        vm.startPrank(user2);
        mon.mint(user2, "ipfs://user2.json");
        vm.expectRevert(bytes("Not owner"));
        vault.deposit{value: 1 ether}(tokenId1);
        vm.stopPrank();
    }

    function testWithdraw() public {
        vm.startPrank(user1);
        uint256 tokenId1 = mon.mint(user1, "ipfs://user1.json");
        vault.deposit{value: 1 ether}(tokenId1);
        vault.withdraw(tokenId1, 0.5 ether);
        vm.stopPrank();

        assertEq(vault.balanceOf(tokenId1), 0.5 ether);

        uint256 afterBalance = user1.balance;
        assertEq(afterBalance, 9.5 ether);
    }

    function testWithdrawWithNotOwner() public {
        vm.startPrank(user1);
        uint256 tokenId1 = mon.mint(user1, "ipfs://user1.json");
        vault.deposit{value: 1 ether}(tokenId1);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(bytes("Not owner"));
        vault.withdraw(tokenId1, 1 ether);
        vm.stopPrank();
    }

    function testWithdrawWithInsufficient() public {
        vm.startPrank(user1);
        uint256 tokenId1 = mon.mint(user1, "ipfs://user1.json");
        vault.deposit{value: 1 ether}(tokenId1);
        vm.expectRevert(bytes("Insufficient"));
        vault.withdraw(tokenId1, 2 ether);
        vm.stopPrank();
    }
}
