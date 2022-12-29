// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract SimpleTalentLayerID {
    struct Profile {
        uint256 id;
        string handle;
        uint256 platformId;
    }

    uint mintFee = 100;

    uint nextId = 1;

    mapping(uint256 => Profile) public profiles;

    mapping(string => bool) public takenHandles;

    function mint(uint256 _platformId, string memory _handle) public payable {
         require(msg.value == mintFee, "Incorrect amount of ETH for mint fee");

        uint256 userTokenId = nextId;
        nextId++;
        
        Profile storage profile = profiles[userTokenId];
        profile.platformId = _platformId;
        profile.handle = _handle;
        takenHandles[_handle] = true;
    }
}
