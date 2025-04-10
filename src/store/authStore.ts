import { create } from "zustand";

interface AuthState {
    isSignIn: boolean;
    setIsSignIn: (isSignIn: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isSignIn: !!localStorage.getItem("access_token"),
    setIsSignIn: (isSignIn: boolean) => set(() => ({ isSignIn })),
}));
