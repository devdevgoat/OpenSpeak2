'use strict'

const IPFS = require('ipfs-core')
const isIPFS = require('is-ipfs')
const { givenProvider } = require('web3')
const Web3 = require('web3')
const Contract = require('web3-eth-contract')
// const artifact = require('../artifacts/contracts/OpenSpeak2.sol/OpenSpeak2.json')
const abi = require("./abi.json")
const contractAddress = '0x01953a75f92f694872B6b6C0bE51AeFA08270797'
const web3 = new Web3(givenProvider)
// const web3 = new Web3("wss://ws-matic-mainnet.chainstacklabs.com")
let ipfs
var hasAlert = false
var lastBlockLogged = 25371843

const DOM = {
    speak: () => document.getElementById('speak'),
    words: () => document.getElementById('words'),
    feed: () =>document.getElementById('feed'),
    refresh: () => document.getElementById('refreshBtn'),
    register: () => document.getElementById('register'),
    error: () => document.getElementById('error'),
}

// ETHEREUM CONFIG
const ethEnabled = async () => {
    if (window.ethereum !== undefined) {
        acts = await window.ethereum.request({method: 'eth_requestAccounts'})
        window.defaultAccount = acts[0]
        web3.eth.defaultAccount = acts[0]
        // window.web3 = new Web3(window.ethereum)
       
        // window.web3.eth.defaultAccount = acts[0]
      return true
    } else{
      alert({"message":'Not a Web3 enabled browser!'})
    }
    return false
}

// ALERT UI
const alert = async (msg) => {
    let el = DOM.error()
    el.innerText = msg
    var popup = new bootstrap.Collapse(el)
    popup.toggle()
    hasAlert= true
}

  const hideAlert = async () => {
    let el = DOM.error()
    el.innerText = ''
    var popup = new bootstrap.Collapse(el)
    popup.toggle()
    hasAlert = false
}

// IPFS FUNCTIONS
const hasIpfsNode = async () => {
    if(ifps) return true
    try {
        
        return true
    } catch (e) {
        alert(`Failed to start IPFS Node. ${e.message}`)
        return false
    }
    
}

const uploadAndGetCID = async (content) => {
    if (!ipfs) {
        // creat ipfs node
        ipfs = await IPFS.create({
          repo: String(Math.random() + Date.now()),
          init: { alogorithm: 'ed25519' }
        })
      }

      // connect to ipfs node
      const id = await ipfs.id()
      // build obj
      const fileToAdd = {
        content: Buffer.from(content)
      }

      //add file
      const file = await ipfs.add(fileToAdd)

      //retrieve file and read
      // const text = await cat(file.cid)

      console.log("Added File:")
      console.log(file.cid)
      console.log(`Preview: https://ipfs.io/ipfs/${file.cid}`)
      return `${file.cid}`
}

const catIPFSFileByCid = async (cid) => {
    if (!ipfs) {
        console.log("Creating ipfs node")
        ipfs = await IPFS.create({
            repo: String(Math.random() + Date.now()),
            init: { alogorithm: 'ed25519' }
        })
    }
    const content = []
    console.log(`Trying to read out file ${cid}`)
    for await (const chunk of ipfs.cat(cid)) {
        content.push(chunk)
    }
    return content
  }

// FEED UI
const populateFeed = async () => {
    // if(!await isRegistered()) return
    try {
      if (hasAlert) hideAlert()
      var addressesToGetPostsOf = [defaultAccount]
      // console.log("got followers... or lack there of")
      for (let _address in addressesToGetPostsOf){
          console.log("Getting post from address ",addressesToGetPostsOf[_address])
          await getPostsOfUserAndPrependToFeed(addressesToGetPostsOf[_address])
      }
    } catch (err) {
      console.log(err)
      alert(err)
    }
}

const getPostsOfUserAndPrependToFeed = async (event) => {
        console.log("Trying to build entry from:")
        console.log(event.returnValues);
        var said = event.returnValues.said; // need to validate is a CID
        var fromAddress = event.returnValues.user //need to validat is an address web3.utils.isAddress(address)
        if(isIPFS.cid(said)){
            if (!document.body.contains(document.getElementById(said))){
                var div = await getFeedEntry(fromAddress,said);
                feed.prepend(div);
            }
        } else {
            console.log(`Some moron posted '${said}' instead of an actual CID...Lets let it through as post content i guess.`)
            var div = await constructFeedEntry(fromAddress,event.id, null, said)
            feed.prepend(div);
        }
        
  }

  const getFeedEntry = async (account, cid, imgCid) => {
    var content = await catIPFSFileByCid(cid);
    var img = `https://ipfs.io/ipfs/${window.userProfile.img}`
    console.log(img)
    return await constructFeedEntry(account,cid, img, content)
}

  const constructFeedEntry = async (from, cid, img, content) => {
    var box = document.createElement("div");
    box.setAttribute("id", cid);
    box.classList.add("bg-white");
    box.classList.add("border");
    box.classList.add("mt-2");
    box.innerHTML = `<div">
          <div class="d-flex flex-row justify-content-between align-items-center p-2 border-bottom">
              <div class="d-flex flex-row align-items-center feed-text px-2">
                  <img class="rounded-circle" src="${img}" width="45">
                  <div class="d-flex flex-column flex-wrap ml-2"><span class="font-weight-bold">
                      ${from}</span><span class="text-black-50 time">40 minutes ago</span>
                  </div>
              </div>
              <div class="feed-icon px-2"><i class="fa fa-ellipsis-v text-black-50"></i></div>
          </div>
      </div>
      <div class="p-2 px-3"><span>${content}</span></div>
      <div class="d-flex justify-content-end socials p-2 py-3"><i class="fa fa-thumbs-up"></i><i class="fa fa-comments-o"></i><i class="fa fa-share"></i></div>`;
  return box;
}

// EVENT LISTNERS
DOM.refresh().onclick = async (e) => {
    //prevent page refresh
    e.preventDefault()
    populateFeed()
  }
DOM.speak().onsubmit = async (e) => {
    //prevent page refresh
    e.preventDefault()
    // let name = DOM.fileName().value
    let content = DOM.words().value
    DOM.words().value = ""
    window.cid = await uploadAndGetCID(content)
    window.lastPost = await window.contract.methods.say(window.cid,"");
    // createEventEntry("Submitting transaction...")
    console.log('Submitting transaction...');
    window.lastPost.send(
        {
            from: window.defaultAccount,
            gas: '3000000'
        })
    .then(function(receipt){
        console.log(receipt);
        // createEventEntry(`Transaction Complete! ${receipt.transactionHash}`);
    });
  }

const subscribe = async () => {
    console.log("trying to subscribe...")
    let options = {
        fromBlock: 0,
        address: [contractAddress],    //Only get events from specific addresses
        topics: []                              //What topics to subscribe to
    }
    
    let subscription = web3.eth.subscribe('logs', options,(err,event) => {
        if (!err)
        console.log(event)
        else console.log(err)
    })
    
    subscription.on('data', event => {
        console.log('Got some data')
        console.log(event)
        getPostsOfUserAndPrependToFeed(event)
    })
    subscription.on('data', nr => {
        console.log('Connected')
        console.log(nr)
    })
}

  // MAIN Loop

  if (ethEnabled) {
    // get friends
    console.log("we have eth!");
    window.ethereum.request({method: 'eth_requestAccounts'}).then(async (acts) => {
        window.defaultAccount = acts[0];
        Contract.setProvider(window.ethereum);
        // window.contract = new Contract(artifact.abi, contractAddress);
        window.contract = new Contract(abi, contractAddress);
        let latest = await web3.eth.getBlockNumber()
        console.log("loading feed");
        //sync blocks from delta
        while (lastBlockLogged<latest) {
            window.contract.getPastEvents('allEvents', {
                // filter: {}, // Using an array means OR: e.g. 20 or 23
                fromBlock: lastBlockLogged, //await web3.eth.getBlockNumber() - 3000,
                toBlock: lastBlockLogged += 3499
            }, function(error, events){ 
                if(error) alert(error.message)
                lastBlockLogged += 3499
                events.forEach(emmitted => {
                    console.log(`checking ${emmitted.event}...`)
                    if (emmitted.event === "publicSpeech") {
                        getPostsOfUserAndPrependToFeed(emmitted)
                    }
                    if (emmitted.event === "newUserJoinedTheParty") {
                        console.log("new user!")
                    }
                })
                console.log(events)
            })
        }
        console.log("Up to date, ready to switch to subscriptions")
        subscribe()
    });
  
  }