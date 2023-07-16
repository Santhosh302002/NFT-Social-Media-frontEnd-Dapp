const { frontEndContractsFile, frontEndAbiFile } = require("../helpher-hardhat-config")
const fs = require("fs")
const { network } = require("hardhat")
const { ethers } = require("hardhat")


module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        // await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const SocialNetworkDapp = await ethers.getContract("SocialNetworkDapp")
    fs.writeFileSync(frontEndAbiFile, SocialNetworkDapp.interface.formatJson())
}

async function updateContractAddresses() {
    const SocialNetworkDapp = await ethers.getContract("SocialNetworkDapp")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    console.log(contractAddresses)
    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(SocialNetworkDapp.address)) {
            contractAddresses[network.config.chainId.toString()].push(SocialNetworkDapp.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [SocialNetworkDapp.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "SocialNetworkDapp"]