import { useAccount, useSignMessage } from "wagmi";
import axios from "axios";
import { ENDPOINTS } from "src/config";
import { notification } from "antd";
import { useAuthStore } from "src/store/authStore";

export function useSignIn() {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const setIsSignIn = useAuthStore((state) => state.setIsSignIn);

    const handleSignIn = async () => {
        const nonce = Math.floor(Math.random() * 1000000);

        const message = `Welcome to the PIVOT platform!
Please sign this message with your wallet to authenticate.

Timestamp: ${Date.now()}
Nonce: ${nonce}`;

        const signature = await signMessageAsync({ message });

        const response = await axios.post(ENDPOINTS.SIGN_IN, {
            walletAddress: address,
            signature,
            message,
        });

        localStorage.setItem("access_token", response.data.accessToken);

        setIsSignIn(true);

        notification.success({
            message: "success",
            description: "Successfully sign in",
            duration: 3,
        });
    };

    return handleSignIn;
}
