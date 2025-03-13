import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

type EthereumRequest = {
    method: string;
    params?: any[];
};

export default function Header() {
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");

    const connectWallet = async (): Promise<void> => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                } as EthereumRequest);
                setWalletAddress(accounts[0]);
                setIsConnected(true);
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <img src={Logo} alt="Logo" className="w-12" />
                    PIVOT
                </Link>
                <div className="flex gap-4">
                    <Link to="/create" className="px-4 bg-[#0e76fd] text-white rounded-xl text-md hover:scale-[1.02] font-bold flex items-center duration-100">
                        Create Topic
                    </Link>
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}
