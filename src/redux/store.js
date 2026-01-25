import { configureStore } from '@reduxjs/toolkit';
import dspaceReducer from './features/dSpaceSlice';

const store = configureStore({
  reducer: {
    dspace: dspaceReducer,
  },
});

export default store;
