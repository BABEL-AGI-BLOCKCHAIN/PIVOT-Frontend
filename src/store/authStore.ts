import { create } from "zustand";

interface UserInfo {
    avatar: string;
    twitterHandle: string;
    walletAddress: string;
}

interface AuthState {
    isSignIn: boolean;
    userInfo?: UserInfo;
    setIsSignIn: (isSignIn: boolean) => void;
    setUserInfo: (userInfo: UserInfo) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isSignIn: !!localStorage.getItem("access_token"),
    userInfo: undefined,
    setIsSignIn: (isSignIn: boolean) => set(() => ({ isSignIn })),
    setUserInfo: (userInfo: UserInfo) => set(() => ({ userInfo })),
}));
