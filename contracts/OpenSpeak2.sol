//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract OpenSpeak2 {

    struct Profile {
        address _address;
        string img;
    }

    struct Post {
        string cid;
        Profile author;
    }

    mapping (address=>Profile) public users;

    event publicSpeech(Post content);

    function say(string memory _cid) public {
        Post memory _post;
        _post.cid = _cid;
        _post.author = getOrMakeProfile();
        emit publicSpeech(_post);
    }

    function getOrMakeProfile() public returns (Profile memory){
        if (users[msg.sender]._address == address(0x0)){
            console.log("New user in the house! %s", msg.sender);
            users[msg.sender] = Profile(msg.sender,"");
        }
        return users[msg.sender];
    }

}