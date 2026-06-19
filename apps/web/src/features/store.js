import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import productsReducer from './products/productsSlice';
import ordersReducer from './orders/ordersSlice';
import customersReducer from './customers/customersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    orders: ordersReducer,
    customers: customersReducer,
  },
});
