import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCustomers = createAsyncThunk('customers/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/customers', { params });
    return response.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createCustomer = createAsyncThunk('customers/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/customers', data);
    return response.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const customersSlice = createSlice({
  name: 'customers',
  initialState: { items: [], pagination: null, isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(createCustomer.fulfilled, (state, action) => { state.items.unshift(action.payload); });
  },
});

export default customersSlice.reducer;
