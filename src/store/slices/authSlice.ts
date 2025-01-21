import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  address: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  address: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; address: string }>
    ) => {
      state.token = action.payload.token;
      state.address = action.payload.address;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.token = null;
      state.address = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

