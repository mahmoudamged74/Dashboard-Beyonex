import { createSlice } from '@reduxjs/toolkit';
import { fetchHeroSection, updateHeroSection } from '../actions/heroActions';
import { bindFetch, bindMutation, createEntityState } from './helpers';

const heroSlice = createSlice({
  name: 'hero',
  initialState: createEntityState(),
  reducers: {},
  extraReducers: (builder) => {
    bindFetch(builder, fetchHeroSection, (state, payload) => {
      state.data = payload;
    });
    bindMutation(builder, updateHeroSection, (state, payload) => {
      if (payload?.data && typeof payload.data === 'object') {
        state.data = { ...state.data, ...payload.data };
      }
    });
  },
});

export const selectHero = (state) => state.hero;
export default heroSlice.reducer;
