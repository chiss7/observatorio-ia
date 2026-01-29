import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSocialMediaMetrics } from '../api/dspaceService';

export const fetchMetrics = createAsyncThunk('metrics/fetch', async (_, { rejectWithValue }) => {
  try {
    const data = await getSocialMediaMetrics();
    return data;
  } catch (err) {
    return rejectWithValue(err || { message: 'Failed to fetch metrics' });
  }
});

const metricsSlice = createSlice({
  name: 'metrics',
  initialState: {
    data: null, // raw JSON from API
    status: 'idle',
    error: null,
  },
  reducers: {
    clearMetrics(state) {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMetrics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      });
  },
});

export const { clearMetrics } = metricsSlice.actions;
export default metricsSlice.reducer;
