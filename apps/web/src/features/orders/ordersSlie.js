import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createOrder = createAsyncThunk('orders/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/orders', data);
    return response.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, paymentStatus }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/orders/${id}/status`, { status, paymentStatus });
    return response.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], pagination: null, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(createOrder.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex(o => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default ordersSlice.reducer;
