import { createSlice } from '@reduxjs/toolkit';
import {
  createPartner,
  deletePartner,
  fetchPartners,
  togglePartnerStatus,
  updatePartner,
} from '../actions/partnersActions';
import { bindFetch, bindMutation, createListState } from './helpers';

const partnersSlice = createSlice({
  name: 'partners',
  initialState: createListState(),
  reducers: {},
  extraReducers: (builder) => {
    bindFetch(builder, fetchPartners, (state, payload) => {
      state.items = payload;
    });
    [createPartner, updatePartner, deletePartner, togglePartnerStatus].forEach((thunk) => {
      bindMutation(builder, thunk);
    });
  },
});

export const selectPartners = (state) => state.partners;
export default partnersSlice.reducer;
