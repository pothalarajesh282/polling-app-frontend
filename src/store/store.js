import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import pollReducer from './slices/pollSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    polls: pollReducer,
    theme: themeReducer
  }
});