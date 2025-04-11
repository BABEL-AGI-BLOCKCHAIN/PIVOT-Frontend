import { useEffect } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import { useAccount } from "wagmi";
import { useAuthStore } from "src/store/authStore";
import { useSignIn } from "src/hooks/useSignIn";
import { ENDPOINTS } from "src/config";
import { notification } from "antd";

export default function Header() {
    const { status, address } = useAccount();
    const isSignIn = useAuthStore((state) => state.isSignIn);
    const setIsSignIn = useAuthStore((state) => state.setIsSignIn);
    const handleSignIn = useSignIn();

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
                    {isSignIn && (
                        <div
                            className="cursor-pointer px-4 bg-[#0e76fd] text-white rounded-xl text-md hover:scale-[1.02] font-bold flex items-center duration-100"
                            onClick={() => {
                                const width = 600;
                                const height = 400;

                                const left = window.screenX + (window.outerWidth - width) / 2;
                                const top = window.screenY + (window.outerHeight - height) / 2;

                                const handleMessage = (event: { origin: string; data: string }) => {
                                    if (event.origin !== window.location.origin) return;

                                    if ((event.data as any).status) {
                                        if ((event.data as any).status === "200") {
                                            notification.success({
                                                message: "success",
                                                description: "Successfully bind",
                                                duration: 3,
                                            });
                                        } else {
                                            notification.error({
                                                message: "error",
                                                description: "Failed to bind",
                                                duration: 3,
                                            });
                                        }
                                        window.removeEventListener("message", handleMessage);
                                    }
                                };

                                window.addEventListener("message", handleMessage);

                                window.open(ENDPOINTS.BIND_TWITTER(address!), "_blank", `width=${width},height=${height},left=${left},top=${top}`);
                            }}
                        >
                            Bind Twitter
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
