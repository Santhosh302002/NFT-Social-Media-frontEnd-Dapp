import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../components/pinata";
import abi from "../constants/createNFTabi.json"
import css from "../styles/global.module.css"


export default function CreateNFT() {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');
    const [NFTfee, setNFTfee] = useState("");
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const [metadata, setmetadata] = useState("0")
    const [price, setprice] = useState("0")
    const [nftCount, setnftCount] = useState("0")
    const DappAddress = "0x1324A5E1A502503B0E6aAC8B5830790417E29E4F"
    // const location = useLocation();


    const {
        runContractFunction: createTokenNFT,
        data: enterTxResponse,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: DappAddress,
        functionName: "createTokenNFT",
        msgValue: NFTfee,
        params: { tokenURI: metadata, price: NFTfee },
    })

    const {
        runContractFunction: getNFTListingFee,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: DappAddress,
        functionName: "getNFTListingFee",
    })
    const {
        runContractFunction: nftTokenId,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: DappAddress,
        functionName: "nftTokenId",
    })

    //This function uploads the NFT image to IPFS
    async function OnChangeFile(e) {
        var file = e.target.files[0];
        //check for file extension
        try {
            updateMessage("Uploading image.. please dont click anything!")
            const response = await uploadFileToIPFS(file);
            console.log(response)
            if (response.success === true) {
                updateMessage("")
                console.log("Uploaded image to Pinata: ", response.pinataURL)
                setFileURL(response.pinataURL);
                const nftCount = await nftTokenId();
                setnftCount((Number(nftCount) + 1).toString())
            }
        }
        catch (e) {
            console.log("Error during file upload", e);
        }
    }

    //This function uploads the metadata to IPFS
    async function uploadMetadataToIPFS() {
        const { name, description, price } = formParams;
        //Make sure that none of the fields are empty
        if (!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields!");
            return -1;
        }
        console.log(nftCount)

        const nftJSON = {
            name, description, price, image: fileURL, nftId: nftCount
        }

        try {
            //upload the metadata JSON to IPFS
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success === true) {
                console.log("Uploaded JSON to Pinata: ", response);
                setmetadata(response.pinataURL)
                setprice(response.pinataURL.toString())
                return response.pinataURL;
            }
        }
        catch (e) {
            console.log("error uploading JSON metadata:", e)
        }
    }

    const listNFT = async (e) => {
        e.preventDefault();

        //Upload data to IPFS
        try {
            const metadataURL = await uploadMetadataToIPFS();
            // const web3 = await Moralis.enableWeb3();
            const fee = await getNFTListingFee();
            setNFTfee(fee.toString())
            setmetadata(metadataURL.toString())
            // setprice((metadataURL.price).toString())
            console.log(metadataURL)
            console.log(metadata)
            if (metadataURL === -1)
                return;
            updateMessage("Uploading NFT(takes 5 mins).. please dont click anything!")
            alert("Successfully listed your NFT!");
            updateMessage("")
            updateFormParams({ name: '', description: '', price: '' });
        }
        catch (e) {
            alert("Upload error" + e)
        }
    };
    const listNFTX = async (e) => {
        e.preventDefault();
        try {
            const NFTcreated = await createTokenNFT();
            console.log(metadata)
            console.log(NFTcreated)
        } catch (e) {
            alert("Upload error" + e)
        }
    }

    async function updateUIValues() {
        const web3 = await Moralis.enableWeb3();
        const allNFT = (await getNFTListingFee()).toString()
        setprice(allNFT)
        setmetadata(metadata.toString())
        console.log(metadata)
        console.log(allNFT)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
            setmetadata(metadata)
        }
    }, [isWeb3Enabled, metadata])

    return (
        <div className={css.nft}>
            <div className={css.nftcard}>
                <form style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "white", paddingLeft: 75 }}>
                    <h3 style={{ color: "white", marginBottom: 60 }}>Upload your NFT to the NFTx</h3>
                    <div className={css.name}>
                        <label style={{ padding: 5, paddingRight: 70 }} htmlFor="name">NFT Name</label>
                        <input style={{ borderRadius: 100, width: 200, height: 30, border: "none", backgroundColor: `rgba(242, 241, 241, 0.55)` }} id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name}></input>
                    </div>
                    <div className={css.name}>
                        <label style={{ padding: 5, paddingRight: 34 }} htmlFor="description">NFT Description</label>
                        <textarea style={{ borderRadius: 10, width: 200, height: 100, border: "none", backgroundColor: `rgba(242, 241, 241, 0.55)` }} id="description" type="text" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })}></textarea>
                    </div>
                    <div className={css.name}>
                        <label style={{ padding: 5, paddingRight: 48 }} htmlFor="price">Price (in ETH)</label>
                        <input style={{ borderRadius: 100, width: 200, height: 30, border: "none", backgroundColor: `rgba(242, 241, 241, 0.55)` }} type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({ ...formParams, price: e.target.value })}></input>
                    </div>
                    <div className={css.name}>
                        <label style={{ marginLeft: 5 }} htmlFor="image">Upload Image</label>
                        <input style={{
                            marginLeft: 56,
                            paddingRight: 80,

                            width: 120,
                            height: 30, border: "none",
                        }} type={"file"} onChange={OnChangeFile}></input>
                    </div>
                    <br></br>
                    <div >{message}</div>
                    <button className={css.nftButton} onClick={listNFT} id="list-button">
                        List NFT
                    </button>
                    <button onClick={listNFTX}>NFTX</button>
                </form>
            </div>
        </div>
    )
}
