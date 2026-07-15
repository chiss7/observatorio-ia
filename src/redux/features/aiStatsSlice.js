import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAIPublicationStats } from '../api/dspaceService';

export const fetchAIPublicationStats = createAsyncThunk('aiStats/fetch', async (_, { rejectWithValue }) => {
  try {
    const data = await getAIPublicationStats();
    return data;
  } catch (err) {
    return rejectWithValue(err || { message: 'Failed to fetch AI publication stats' });
  }
});

const aiStatsSlice = createSlice({
  name: 'aiStats',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearAiStats(state) {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIPublicationStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAIPublicationStats.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAIPublicationStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      });
  },
});

export const { clearAiStats } = aiStatsSlice.actions;
export default aiStatsSlice.reducer;
