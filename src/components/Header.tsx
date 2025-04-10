import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { useAccount } from "wagmi";
import { useAuthStore } from "src/store/authStore";
import { useSignIn } from "src/hooks/useSignIn";

export default function Header() {
    const { status } = useAccount();
    const isSignIn = useAuthStore((state) => state.isSignIn);
    const handleSignIn = useSignIn();
    const setIsSignIn = useAuthStore((state) => state.setIsSignIn);

    useEffect(() => {
        if (status === "connected" && !isSignIn) {
            handleSignIn().catch((error) => {});
        } else if (status === "disconnected") {
            localStorage.removeItem("access_token");
            setIsSignIn(false);
        }
    }, [status]);

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
