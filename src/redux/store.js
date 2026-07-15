import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'hero/update/fulfilled',
          'services/create/fulfilled',
          'about/updatePage/fulfilled',
        ],
      },
    }),
  devTools: import.meta.env.DEV,
});
