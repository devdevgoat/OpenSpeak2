// Oddly enough on polygon I can read transaction logs way faster than
// than ipfs content... so I'm just going to store it all in 
// the logs for now, might comeback to ipfs for bigger file uploads 
// like photos and shit...

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
    //   console.log(`Preview: https://ipfs.io/ipfs/${file.cid}`)
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
    console.log(new TextDecoder().decode(content))
    return content
  }