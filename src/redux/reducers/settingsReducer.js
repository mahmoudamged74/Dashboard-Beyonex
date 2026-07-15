import { createSlice } from '@reduxjs/toolkit';
import { fetchSettings, updateSettings } from '../actions/settingsActions';
import { bindFetch, bindMutation, createEntityState } from './helpers';

const settingsSlice = createSlice({
  name: 'settings',
  initialState: createEntityState(),
  reducers: {},
  extraReducers: (builder) => {
    bindFetch(builder, fetchSettings, (state, payload) => {
      state.data = payload;
    });
    bindMutation(builder, updateSettings, (state, payload) => {
      if (payload?.data) state.data = { ...state.data, ...payload.data };
    });
  },
});

export const selectSettings = (state) => state.settings;
export default settingsSlice.reducer;
