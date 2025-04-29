import { useContext, useEffect, useState } from "react"
import { Navbar } from "../components/Navbar";
import Home from "../components/Home";
import jws from "../contract/key.json";
import { PinataSDK } from "pinata-web3";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Create from "../components/Create";
import { NearContext } from '@/wallets/near';
import Explore from "../components/Explore";
import {CrowdfundingNearContract} from "../config.js";
import "../styles/app.module.css"

const CONTARCT = CrowdfundingNearContract;
const pinata = new PinataSDK({
    pinataJwt: jws.jws,
    pinataGateway: "beige-sophisticated-baboon-74.mypinata.cloud",
})

const IndexPage = () => {
    const { signedAccountId, wallet } = useContext(NearContext);
    const [route, setRoute] = useState("home");
    const [connected, setConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldFetchData, setShouldFetchData] = useState(false);
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        if (signedAccountId) {
            setConnected(true)
        } else {
            setConnected(false)
        }
    }, [signedAccountId])

    useEffect(() => {
        async function getAllNFTs() {
            if (connected && signedAccountId) {
                try {
                    setIsLoading(true);
                    const campaigns = await wallet.viewMethod({
                        contractId: CONTARCT,
                        method: "get_campaigns"
                    });

                    const currentTimestamp = Math.floor(Date.now() / 1000);
                    const deadlineNanoseconds = currentTimestamp * 1_000_000_000;

                    const camp = campaigns.map(([id, campaign]) => {
                        const collectedAmount = parseFloat(campaign.amount_collected.split(" ")[0]);
                        const targetAmount = parseFloat(campaign.target.split(" ")[0]);
                        console.log(collectedAmount, targetAmount, id);
                        if (collectedAmount >= targetAmount) {
                            console.log("closed", id)
                        }
                        return {

                            id,
                            ...campaign,
                            status: campaign.deadline > deadlineNanoseconds && collectedAmount < targetAmount ? "open" : "closed"
                        }
                    });

                    console.log(camp);
                    
                    setCampaigns(camp);
                    setShouldFetchData(false);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error fetching NFTs:', error);
                    toast.error("Error fetching NFTs", {
                        position: "top-center"
                    })
                }
            }
        }
        getAllNFTs();
    }, [shouldFetchData, connected, signedAccountId]);

    const onRouteChange = (route) => {
        console.log(route);
        setRoute(route);
    }

    const uploadToPinata = async (file) => {
        if (!file) {
            throw new Error("File is required");
        }

        try {
            toast.info("Uploading Image to IPFS", {
                position: "top-center"
            })
            const uploadImage = await pinata.upload.file(file);
            const metadata = `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${uploadImage.IpfsHash}`;

            return metadata;
        } catch (error) {
            console.error("Error uploading to Pinata:", error);
            toast.error("Creating Fund failed.", {
                position: "top-center"
            });
            throw new Error("Upload to Pinata failed.");
        }
    };

    const createFund = async (ImageIpfsHash, title, description, targetAmount, time) => {
        try {
            console.log(ImageIpfsHash, title, description, targetAmount, time);
            const scaledPrice = Math.round(targetAmount * 1e24);
            const scaledTargetAmount = BigInt(scaledPrice).toString();

            const fee = 0.01;
            const scaledPrice2 = Math.round(fee * 1e24);
            const scaledFeeAmount = BigInt(scaledPrice2).toString();
            const tx = await wallet.callMethod({
                contractId: CONTARCT,
                method: 'create_campaign',
                args: {
                    image: ImageIpfsHash.toString(),
                    title: title.toString(),
                    description: description.toString(),
                    target: scaledTargetAmount,
                    deadline: Number(time)
                },
                deposit: scaledFeeAmount.toString()
            });
            console.log(tx);
            toast.success("Campaign created!!", {
                position: "top-center"
            })
            setShouldFetchData(true);
            onRouteChange("explore");
        } catch (e) {
            toast.error("Error creating funds", {
                position: "top-center"
            });
            console.error("error", e)
        }
    }

    const fundCampaign = async (id, amount) => {
        try {
            const scaledPrice = Math.round(amount * 1e24);
            const scaledFundAmount = BigInt(scaledPrice).toString();

            const tx = await wallet.callMethod({
                contractId: CONTARCT,
                method: "donate",
                args: {
                    campaign_id: Number(id)
                },
                deposit: scaledFundAmount.toString(),
            })
            console.log(tx);
            toast.success("Campaign Funded!!", {
                position: "top-center"
            })
            setShouldFetchData(true);
        } catch (e) {
            toast.error("Error funding campaign", {
                position: "top-center"
            });
            console.error("error", e)
        }
    }

    return (
        <div>
            <ToastContainer />
            <div>
                <div>
                    <Navbar onRouteChange={onRouteChange} />
                    {route === "home" ? (
                        <Home onRouteChange={onRouteChange} />
                    ) : route === "explore" ? (
                        <Explore campaigns={campaigns} isConnected={connected} isLoading={isLoading} fundCampaign={fundCampaign}/>
                    ) : route === "create" ? (
                        <Create uploadToPinata={uploadToPinata} createFund={createFund} />
                    ) : <>No page found</>}
                </div>
            </div>
        </div>
    )
}

export default IndexPage;