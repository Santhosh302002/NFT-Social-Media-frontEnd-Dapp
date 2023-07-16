import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import abi from "../constants/createNFTabi.json"
import css from "../styles/global.module.css"
import { ethers } from "ethers";
import axios from 'axios';
import { NFT } from "web3uikit";
import Card from "../components/Card"


export default function Profile() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const [metadata, setmetadata] = useState("0")
    const [NFTurl, setNFTurl] = useState([])
    const DappAddress = "0x1324A5E1A502503B0E6aAC8B5830790417E29E4F"
    // document.body.style = 'background: black;';

    const {
        runContractFunction: getNFTListingFee,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: DappAddress,
        functionName: "getNFTListingFee",
    })


    const {
        runContractFunction: getAllNFT,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: DappAddress,
        functionName: "getAllNFT",
    })

    async function updateUIValues() {
        const web3 = await Moralis.enableWeb3();
        const myNFT = (await getAllNFT())
        const NFTfee = (await getNFTListingFee()).toString()
        console.log(NFTfee)
        setmetadata(NFTfee)
        console.log(myNFT)
        setNFTurl(myNFT[2].toString().split(","));
        console.log(NFTurl)
    }

    async function request(url) {
        if (url.length < 20) {
            return;
        }
        try {
            const res = await axios.get(url, {
                headers: {
                    'Accept': 'text / plain'
                }
            })
            console.log("Correct Header Status:", res.data)
        } catch (error) {
            console.log(error)
        }

    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled, NFTurl])

    return (
        <div style={{ backgroundColor: "black", margin: 0, padding: 0 }}>
            {/* Your JSX components */}
            {NFTurl.map((url) =>
            (
                <div>{
                    <Card url={url} />
                }
                </div>
            )
            )}
            <button onClick={updateUIValues}>click</button>
        </div>

    );
}