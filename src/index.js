'use strict'

const { poll } = require('ethers/lib/utils')
// const IPFS = require('ipfs-core')
const isIPFS = require('is-ipfs')
const { givenProvider } = require('web3')
const Web3 = require('web3')
const Contract = require('web3-eth-contract')
// const artifact = require('../artifacts/contracts/OpenSpeak2.sol/OpenSpeak2.json')
const abi = require("./abi.json")
const contractAddress = '0x01953a75f92f694872B6b6C0bE51AeFA08270797'
const web3 = new Web3(givenProvider)
// const web3 = new Web3("wss://ws-matic-mainnet.chainstacklabs.com")
var hasAlert = false
var contractGenisisBlock = 25322001
var blockDeltaMax = 900
var oldestBlockQueried = -1
var numberOfBlockBatchesToRun = 10

const DOM = {
    speak: () => document.getElementById('speak'),
    words: () => document.getElementById('words'),
    feed: () =>document.getElementById('feed'),
    sendToVoid: () => document.getElementById('sendToVoid'),
    // refresh: () => document.getElementById('refreshBtn'),
    // register: () => document.getElementById('register'),
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

// FEED UI


const getPostsOfUserAndPrependToFeed = async (event,appendTrueFalse) => {
        var said = event.returnValues.said; // need to validate is a CID
        var fromAddress = event.returnValues.user //need to validat is an address web3.utils.isAddress(address)
        var fromProfile = await getUserProfile(fromAddress)
        var ts = await getTimeByBlock(event.blockNumber)
        var div = await buildFeedDiv(fromProfile._address,event.id,fromProfile.imgCid, said, ts)
        if (!document.body.contains(document.getElementById(event.id))){
            if(appendTrueFalse) feed.append(div)
                else feed.prepend(div)
        }
  }

const getTimeByBlock = async(blockNumber) => {
    const blockData = await web3.eth.getBlock(blockNumber)
    var date = new Date(blockData.timestamp * 1000);
    return date
}

const buildFeedDiv = async (from, cid, img, content, ts) => {
    var box = document.createElement("div");
    box.setAttribute("id", cid);
    if(isIPFS.cid(img)) img = `https://mainnet.cutymals.com/api/Ipfs/${img}?X-API-KEY=ILoveCutyMals`
    box.classList.add("bg-white");
    box.classList.add("border");
    box.classList.add("mt-2");
    box.innerHTML = `<div">
          <div class="d-flex flex-row justify-content-between align-items-center p-2 border-bottom">
              <div class="d-flex flex-row align-items-center feed-text px-2">
                  <img class="rounded-circle" src="${img}" width="45">
                  <div class="d-flex flex-column flex-wrap ml-2"><span class="font-weight-bold">
                      <a href="?user=${from}">${from}</a>
                      </span><span class="text-black-50 time">${ts}</span>
                  </div>
              </div>
              <div class="feed-icon px-2"><i class="fa fa-ellipsis-v text-black-50"></i></div>
          </div>
      </div>
      <div class="p-2 px-3"><span>${content}</span></div>
      <div class="d-flex justify-content-end socials p-2 py-3"><i class="fa fa-thumbs-up"></i><i class="fa fa-comments-o"></i><i class="fa fa-share"></i></div>`;
  return box;
}

const submitSpeechViaLog = async (e) => {
    //prevent page refresh
    e.preventDefault()
    // let name = DOM.fileName().value
    let content = DOM.words().value
    DOM.words().value = ""
    window.lastPost = await window.contract.methods.say(content,"");
    console.log('Submitting transaction...');
    window.lastPost.send(
        {
            from: window.defaultAccount,
            gas: '3000000'
        })
    .then(function(receipt){
        console.log(receipt);
        // pollLogs();
        // createEventEntry(`Transaction Complete! ${receipt.transactionHash}`);
    }).catch((err) => {
        alert(err.message)
    });
}

const getLogs = async () => {
    var sub = await web3.eth.subscribe('logs', {address:"0xEd8F31bDd8788D54c3b573FC9eCF2ae04c26090B"},(err,event) => {
        if (err) console.log(err)
        else console.log(event)
    })

    sub.on("connected",(subid) => {
        console.log(`Connected with subid ${subid}`)
    })

    sub.on("data", (log) => {
        console.log(`Got data with log ${log}`)
    })
}

const getLogsFromBlockToBlock = async (fromBlock,toBlock,appendTrueFalse,_filter=false) => {
    console.log(_filter)
    await window.contract.getPastEvents('allEvents', {
        topics: _filter ? [,_filter] : [], // Using an array means OR: e.g. 20 or 23
        fromBlock: fromBlock, //await web3.eth.getBlockNumber() - 3000,
        toBlock: toBlock
    }, function(error, events){ 
        if(error) alert(error.message)
        if (events){
            if (events.length >0) {
                console.log(events)
                events.forEach(emmitted => {
                    // console.log(`checking ${emmitted.event}...`)
                    if (emmitted.event === "publicSpeech") {
                        getPostsOfUserAndPrependToFeed(emmitted,appendTrueFalse)
                    }
                    if (emmitted.event === "newUserJoinedTheParty") {
                        // console.log("new user!")
                    }
                })}
        }
    })
}

const getMoreLogs = async (_filter) => {
    console.log(oldestBlockQueried , contractGenisisBlock)
    if (oldestBlockQueried >= contractGenisisBlock){
        console.log(oldestBlockQueried, contractGenisisBlock)
        for (let blockGroupsQueried = 0; blockGroupsQueried<=numberOfBlockBatchesToRun; blockGroupsQueried++){
            let fromBlock = oldestBlockQueried - blockDeltaMax
            console.log(`Loading logs from block ${fromBlock} to block ${oldestBlockQueried}`)
            await getLogsFromBlockToBlock(fromBlock,oldestBlockQueried,true,_filter)
            oldestBlockQueried = fromBlock
        }
    } else {
        console.log("got all blocks since contract geneisis")
    }
}
window.Int = 0
const pollLogs = async (_filter) => {
    window.setInterval(async function(){
        window.currentBlock = await web3.eth.getBlockNumber()
        if (window.currentBlock != window.latestBlock ){
            console.log(`Checking for new blocks ${window.latestBlock} to block ${window.currentBlock}`)
            await getLogsFromBlockToBlock(window.latestBlock,window.currentBlock,false,_filter)
            window.currentBlock = window.latestBlock
        }
    }, 5000);
}

// EVENT LISTNERS
DOM.speak().onsubmit = async (e) => submitSpeechViaLog(e)
DOM.sendToVoid().onclick = async (e) => submitSpeechViaLog(e)


  // MAIN Loop

  /*
    - need to poll backwards a few block at the start, then wait until 'load more' is pressed. ending at the contract genisis
    - also, need to poll periodically for new block moving forward
  */

const connectToBlockchain = async () => {
    window.ethereum.request({method: 'eth_requestAccounts'}).then(async (acts) => {
        window.defaultAccount = acts[0];
        Contract.setProvider(window.ethereum);
        window.contract = new Contract(abi, contractAddress);
        window.user = await getUserProfile(window.defaultAccount)
    });
}

const getUserProfile = async (_address) => {
    //getProfileOfUser
    return await window.contract.methods.getProfileOfUser(_address).call({from:window.defaultAccount});
}

const main = async () => {
    if (ethEnabled) {
    
        const queryString = window.location.search;
        await connectToBlockchain()
        console.log("connected...")
        window.latestBlock = oldestBlockQueried = await web3.eth.getBlockNumber()
        let filter = {}
        // home page
        if(queryString==0){
            console.log(`Welome home!`)
            getMoreLogs()
            pollLogs()
        } else {
            const urlParams = new URLSearchParams(queryString);
            // some other users profile page
            if( urlParams.has('user')){
                console.log(`You're trying to view profile ${urlParams.get('user')}`)
                filter = urlParams.get('user').substring(2,).padStart(64,0).padStart(66,'0x')
                // filter = { "said": "lets see if my polling pays off now!" }
                getMoreLogs(filter)
                pollLogs(filter)
            }
            // this users page
            if( urlParams.has('profile')){
                console.log(`lets get your profile loaded up!`)
                // just load the users info
                console.log('gotta go query the directory!')
            }
        }
    
    } else {
        alert('Please reload page with a Web3 capabable browser (Brave, chrome, etc) and wallet (metamask, frame, etc).')
    } 
}

main()
