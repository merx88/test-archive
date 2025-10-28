// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {MONCharacter} from "../src/MONCharacter.sol";
import {MONCharacterVault} from "../src/MONCharacterVault.sol";

contract CounterScript is Script {
    MONCharacter public character;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        character = new MONCharacter();

        vm.stopBroadcast();
    }
}
