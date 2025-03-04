import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

import "./Header.css";

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
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">
                    <img src={Logo} />
                    PIVOT
                </Link>
                <div className="header-actions">
                    <Link to="/create" className="create-button">
                        Create Topic
                    </Link>
                    <ConnectButton />
                </div>
            </div>
        </header>
    );
}
