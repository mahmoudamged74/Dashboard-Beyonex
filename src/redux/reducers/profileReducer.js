import { createSlice } from '@reduxjs/toolkit';
import { fetchProfile, updateProfile } from '../actions/profileActions';
import { bindFetch, bindMutation, createEntityState } from './helpers';

const profileSlice = createSlice({
  name: 'profile',
  initialState: createEntityState(),
  reducers: {},
  extraReducers: (builder) => {
    bindFetch(builder, fetchProfile, (state, payload) => {
      state.data = payload;
    });
    bindMutation(builder, updateProfile, (state, payload) => {
      if (payload?.data) state.data = payload.data;
    });
  },
});

export const selectProfile = (state) => state.profile;
export default profileSlice.reducer;
