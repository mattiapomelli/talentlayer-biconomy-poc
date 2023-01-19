// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@opengsn/contracts/src/ERC2771Recipient.sol";

contract SimpleTalentLayerID is ERC2771Recipient {
    uint mintFee = 100;

    mapping (address => string) public handles;

    function mint(string memory _handle) public payable {
        require(msg.value == mintFee, "Incorrect amount of ETH for mint fee");
        handles[_msgSender()] = _handle;
    }

    /* TODO: make this onlyOwner */
    function setTrustedForwarder(address _trustedForwarder) internal {
        _setTrustedForwarder(_trustedForwarder);
    }
}
