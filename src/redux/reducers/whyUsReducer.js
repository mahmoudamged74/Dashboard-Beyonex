import { createSlice } from '@reduxjs/toolkit';
import {
  createWhyUs,
  deleteWhyUs,
  fetchWhyUs,
  toggleWhyUsStatus,
  updateWhyUs,
} from '../actions/whyUsActions';
import { bindFetch, bindMutation, createListState } from './helpers';

const whyUsSlice = createSlice({
  name: 'whyUs',
  initialState: createListState(),
  reducers: {},
  extraReducers: (builder) => {
    bindFetch(builder, fetchWhyUs, (state, payload) => {
      state.items = payload;
    });
    [createWhyUs, updateWhyUs, deleteWhyUs, toggleWhyUsStatus].forEach((thunk) => {
      bindMutation(builder, thunk);
    });
  },
});

export const selectWhyUs = (state) => state.whyUs;
export default whyUsSlice.reducer;
