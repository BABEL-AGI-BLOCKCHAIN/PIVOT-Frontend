import { useDispatch, useSelector } from 'react-redux';
import { useSignMessage } from 'wagmi';
import { authApi } from '../api/auth';
import { setCredentials, logout } from '../store/slices/authSlice';
import type { RootState } from '../store/store';

export function useAuth() {
  const dispatch = useDispatch();
  const { signMessageAsync } = useSignMessage();
  const { token, address, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const signInWithEthereum = async (walletAddress: string) => {
    try {
      // Get nonce from the server
      const nonce = await authApi.getNonce(walletAddress);

      // Sign the nonce
      const signature = await signMessageAsync({
        message: `Sign this message to verify your identity. Nonce: ${nonce}`,
      });

      // Verify signature and get JWT token
      const { token: authToken } = await authApi.login(walletAddress, signature);

      // Store credentials in Redux
      dispatch(setCredentials({ token: authToken, address: walletAddress }));

      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const signOut = () => {
    dispatch(logout());
  };

  return {
    token,
    address,
    isAuthenticated,
    signInWithEthereum,
    signOut,
  };
}

