import { configureStore } from '@reduxjs/toolkit';
import dspaceReducer from './features/dSpaceSlice';
import metricsReducer from './features/metricsSlice';

const store = configureStore({
  reducer: {
    dspace: dspaceReducer,
    metrics: metricsReducer,
  },
});

export default store;
