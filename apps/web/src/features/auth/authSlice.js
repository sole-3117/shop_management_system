import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async ({ email, password, tenantSlug }, { rejectWithValue }) => {
  try {
    let response;
    if (tenantSlug) {
      response = await api.post('/auth/login', { email, password }, {
        headers: { 'x-tenant-id': tenantSlug },
      });
    } else {
      response = await api.post('/super-admin/login', { email, password });
    }

    const { user, accessToken, refreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    if (tenantSlug) localStorage.setItem('tenantSlug', tenantSlug);
    else localStorage.removeItem('tenantSlug');

    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Xatolik');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isLoading: false, error: null, isAuthenticated: false },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tenantSlug');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => { state.isLoading = false; state.user = action.payload; state.isAuthenticated = true; })
      .addCase(login.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(getMe.fulfilled, (state, action) => { state.user = action.payload; state.isAuthenticated = true; })
      .addCase(getMe.rejected, (state) => { state.isAuthenticated = false; state.user = null; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
