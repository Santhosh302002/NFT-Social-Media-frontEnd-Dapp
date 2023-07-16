import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../components/pinata";
import abi from "../constants/createNFTabi.json"
import css from "../styles/global.module.css"
import axios from 'axios';

export default function Card(props) {
    const [responseData, setResponseData] = useState(null);
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const [comments, setcomments] = useState("0")
    const [nftID, setnftID] = useState("0")
    const [price, setprice] = useState("0")
    const DappAddress = "0x1324A5E1A502503B0E6aAC8B5830790417E29E4F"


    const {
        runContractFunction: BuyNFT,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: DappAddress,
        functionName: "BuyNFT",
        params: { tokenId: nftID },
        msgValue: price
    })

    const {
        runContractFunction: enterComment,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: DappAddress,
        functionName: "enterComment",
        params: { tokenId: nftID, comment: comments },
    })

    async function request(url) {
        if (url.length < 20) {
            return;
        }
        try {
            const res = await axios.get(url, {
                headers: {
                    'Accept': 'text/plain'
                }
            });
            setResponseData(res.data); // Update the state with the response data
            console.log(res.data)
            setnftID((res.data.nftId).toString())
            setprice(((res.data.price) * 1000000000000000000).toString())
        } catch (error) {
            console.log(error);
        }
    }
    async function Buy() {
        const buy = await BuyNFT();
        console.log(responseData.nftId)
        console.log(buy)

    }

    async function commentNFT() {
        const commentSection = await enterComment();
        console.log(typeof (nftID))
        console.log(comments)

    }
    async function updateUIValues() {
        setcomments((comments).toString())
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUIValues()
        }
    }, [isWeb3Enabled])

    useEffect(() => {
        request(props.url); // Call the request function when the component mounts or when the URL prop changes

    }, [props.url]);

    return (
        <div className={css.card} >
            {responseData && (
                <div className={css.innerCard}>
                    <div className={css.Owner}>Owner</div>
                    <div>
                        <div className={css.image} style={{
                            backgroundImage: `url(${responseData.image})`,
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "cover",
                            width: 515,
                            height: 400,
                        }} ></div></div>
                    <div className={css.description}>{responseData.description}</div>
                    <div className={css.price}>Price : {responseData.price} Eth</div>
                    <div className={css.buttons}>
                        <div className={css.button} onClick={Buy}>Buy</div>
                        <div className={css.comment}>Comment</div>
                    </div>
                    <input className={css.commenting} placeholder="Comment Here" type='text' id='input' onClick={commentNFT} onChange={(e) => setcomments(e.target.value)}></input>
                </div>
            )
            }
        </div >
    );
}
