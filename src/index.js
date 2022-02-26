'use strict'

const IPFS = require('ipfs-core')
const Web3 = require('web3')
const Contract = require('web3-eth-contract')
const abi = require('../artifacts/contracts/OpenSpeak2.sol/OpenSpeak2.json')
const contractAddress = '0x01953a75f92f694872B6b6C0bE51AeFA08270797'
const web3 = new Web3(Web3.givenProvider)

var hasAlert = false;

const DOM = {
    speak: () => document.getElementById('speak'),
    words: () => document.getElementById('words'),
    feed: () =>document.getElementById('feed'),
    refresh: () => document.getElementById('refreshBtn'),
    register: () => document.getElementById('register'),
    error: () => document.getElementById('error'),
}

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
const hasIpfsNode = () => {
    if(ifps) return true
    try {
        ipfs = await IPFS.create({
            repo: String(Math.random() + Date.now()),
            init: { alogorithm: 'ed25519' }
        })
        return true
    } catch (e) {
        alert(`Failed to start IPFS Node. ${e.message}`);
        return false
    }
    
}

const uploadAndGetCID = async (content) => {
    if(hasIpfsNode) {
        // connect to ipfs node
        const id = await ipfs.id()
        // build obj
        const fileToAdd = {
        content: Buffer.from(content)
        }
        //add file
        const file = await ipfs.add(fileToAdd)
        //retrieve file and read
        console.log("Added File:")
        console.log(file.cid)
        alert(`Preview: https://ipfs.io/ipfs/${file.cid}`)
        return `${file.cid}`
    } else {
        console.error("Unable to start node while getting CID")
    }
}

const catIPFSFileByCid = async (cid) => {
    if(hasIpfsNode){
        const content = [];
        console.log(`Trying to read out file ${cid}`);
        for await (const chunk of ipfs.cat(cid)) {
          content.push(chunk);
        }
        return content;
    } else {
        console.error("Unable to start node while catting out CID")
    }
  }
