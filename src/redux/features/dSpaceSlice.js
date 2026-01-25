import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDspaceInfo } from '../api/dspaceService';

export const fetchDspace = createAsyncThunk(
  'dspace/fetchDspace',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await getDspaceInfo(payload);
      return response;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

const initialState = {
  data: null,
  status: 'idle',
  error: null,
};

const dSpaceSlice = createSlice({
  name: 'dspace',
  initialState,
  reducers: {
    clearDspace(state) {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDspace.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDspace.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchDspace.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      });
  },
});

export const { clearDspace } = dSpaceSlice.actions;
export default dSpaceSlice.reducer;
