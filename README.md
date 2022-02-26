# OpenSpeak version 2 

The goal of this project is to create a simple social media platform ontop of ethereum. 

Most recent contract deployment: [0x01953a75f92f694872B6b6C0bE51AeFA08270797](https://polygonscan.com/address/0x01953a75f92f694872B6b6C0bE51AeFA08270797)

# Expected use

Ideally, the contract should the bare minimum needed to connect a client too and show a social media platform.

The contract should only show the current state, with past data (posts) stored in the log/blockchain.

Posts themselves should live as IPFS documents with a standardized strcuture. Forexample, the client would create a json file like the below example:

```json 
{
    "type":"post",
    "author":"0x31bdC35f33b0f2447521e1D0c0E1E7B2acD9090f",
    "content":"Hello World!",
    "parent_cid": null,
    "topics": [
        "beginners",
        "isthisahashtag"
    ]
}
```

Upload it to IPFS and return the CID: QmRvNLxeAaCwSMW7AeHA71Smz2tWSADwjbbeCJ3tqWwqM8

Then post that CID to the contract using say("QmRvNLxeAaCwSMW7AeHA71Smz2tWSADwjbbeCJ3tqWwqM8",""), signifying it is a top level post.

# What this implies

This means we'll need a few things later on, like a validator for the valid ipfs files, so the client can filter invalid posts. 

Since no posts will be stored in the contract, you'll have to traverse the blocks for POST events in order to show activity of a user.

To enable follow support, we'll have to expand the contracts scope and add a friend/follow array.

It's a fair bit of work, but the result: no one owns our data. You want an algo on top? build one. Don't want that? build a client without it. Want to serve advertisements? Better be a good as fucking client, bc someone else will just offer a free one without ads. 

May the best client win!