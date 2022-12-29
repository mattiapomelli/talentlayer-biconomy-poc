// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Lock {
    function deposit() public payable {
        require(msg.value == 100, "Incorrect amount of ETH for deposit");
    }
}
