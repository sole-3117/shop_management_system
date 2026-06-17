import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createProduct = createAsyncThunk('products/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/products', data);
    return response.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/products/${id}`, data);
    return response.data.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], pagination: null, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(createProduct.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      });
  },
});

export default productsSlice.reducer;
