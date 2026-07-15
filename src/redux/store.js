import { configureStore } from '@reduxjs/toolkit';
import dspaceReducer from './features/dSpaceSlice';
import metricsReducer from './features/metricsSlice';
import aiStatsReducer from './features/aiStatsSlice';

const store = configureStore({
  reducer: {
    dspace: dspaceReducer,
    metrics: metricsReducer,
    aiStats: aiStatsReducer,
  },
});

export default store;
