import { useContext, useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import Home from "../components/Home";
import jws from "../contract/key.json";
import { PinataSDK } from "pinata-web3";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Create from "../components/Create";
import { NearContext } from '@/wallets/near';
import Explore from "../components/Explore";
import { CrowdfundingNearContract } from "../config.js";
import "../styles/app.module.css";
import Login from "@/components/Login";
import { AuthProvider , useAuth} from "@/contexts/AuthContext";
const CONTARCT = CrowdfundingNearContract;
const pinata = new PinataSDK({
    pinataJwt: jws.jws,
    pinataGateway: "beige-sophisticated-baboon-74.mypinata.cloud",
});


function PrivateRoute({ children }) {
    const { currentUser } = useAuth();

    if (currentUser === undefined) return <div>Loading...</div>;

    if (!currentUser) {
        return <Login />;  // Reuse your full login page
    }

    return children;
}


const IndexPage = () => {
    const { signedAccountId, wallet } = useContext(NearContext);
    const [route, setRoute] = useState("home");
    const [connected, setConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldFetchData, setShouldFetchData] = useState(false);
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        setConnected(!!signedAccountId);
    }, [signedAccountId]);

    useEffect(() => {
        async function getAllNFTs() {
            if (connected && signedAccountId) {
                try {
                    setIsLoading(true);
                    const campaigns = await wallet.viewMethod({
                        contractId: CONTARCT,
                        method: "get_campaigns",
                    });

                    const currentTimestamp = Math.floor(Date.now() / 1000);
                    const deadlineNs = currentTimestamp * 1_000_000_000;

                    const camp = campaigns.map(([id, campaign]) => {
                        const collected = parseFloat(campaign.amount_collected.split(" ")[0]);
                        const target = parseFloat(campaign.target.split(" ")[0]);

                        return {
                            id,
                            ...campaign,
                            status: campaign.deadline > deadlineNs && collected < target ? "open" : "closed",
                        };
                    });

                    setCampaigns(camp);
                    setShouldFetchData(false);
                    setIsLoading(false);
                } catch (error) {
                    console.error("Error fetching NFTs:", error);
                    toast.error("Error fetching NFTs", { position: "top-center" });
                }
            }
        }

        getAllNFTs();
    }, [shouldFetchData, connected, signedAccountId]);

    const onRouteChange = (route) => {
        setRoute(route);
    };

    const uploadToPinata = async (file) => {
        if (!file) throw new Error("File is required");

        try {
            toast.info("Uploading Image to IPFS", { position: "top-center" });
            const uploadImage = await pinata.upload.file(file);
            return `https://beige-sophisticated-baboon-74.mypinata.cloud/ipfs/${uploadImage.IpfsHash}`;
        } catch (error) {
            console.error("Error uploading to Pinata:", error);
            toast.error("Creating Fund failed.", { position: "top-center" });
            throw error;
        }
    };

    const createFund = async (imageHash, title, description, targetAmount, time) => {
        try {
            const scaledTarget = BigInt(Math.round(targetAmount * 1e24)).toString();
            const scaledFee = BigInt(Math.round(0.01 * 1e24)).toString();

            const tx = await wallet.callMethod({
                contractId: CONTARCT,
                method: 'create_campaign',
                args: {
                    image: imageHash,
                    title,
                    description,
                    target: scaledTarget,
                    deadline: Number(time),
                },
                deposit: scaledFee,
            });

            toast.success("Campaign created!!", { position: "top-center" });
            setShouldFetchData(true);
            onRouteChange("explore");
        } catch (e) {
            console.error("Error creating fund:", e);
            toast.error("Error creating funds", { position: "top-center" });
        }
    };

    const fundCampaign = async (id, amount) => {
        try {
            const scaledAmount = BigInt(Math.round(amount * 1e24)).toString();

            const tx = await wallet.callMethod({
                contractId: CONTARCT,
                method: "donate",
                args: { campaign_id: Number(id) },
                deposit: scaledAmount,
            });

            toast.success("Campaign Funded!!", { position: "top-center" });
            setShouldFetchData(true);
        } catch (e) {
            console.error("Error funding campaign:", e);
            toast.error("Error funding campaign", { position: "top-center" });
        }
    };

    return (
        <AuthProvider>
            <ToastContainer />
            <Navbar onRouteChange={onRouteChange} />
            {route === "home" ? (
                <Home onRouteChange={onRouteChange} />
            ) : route === "explore" ? (
                <Explore
                    campaigns={campaigns}
                    isConnected={connected}
                    isLoading={isLoading}
                    fundCampaign={fundCampaign}
                />
            ) : route === "create" ? (
                <PrivateRoute>
                    <Create uploadToPinata={uploadToPinata} createFund={createFund} />
                </PrivateRoute>
            ) : (
                <>No page found</>
            )}
        </AuthProvider>
    );
};

export default IndexPage;
