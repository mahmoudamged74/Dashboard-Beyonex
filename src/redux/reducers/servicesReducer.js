import { createSlice } from '@reduxjs/toolkit';
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
} from '../actions/servicesActions';
import { bindFetch, bindMutation, createListState } from './helpers';

const servicesSlice = createSlice({
  name: 'services',
  initialState: createListState(),
  reducers: {},
  extraReducers: (builder) => {
    bindFetch(builder, fetchServices, (state, payload) => {
      state.items = payload;
    });
    [createService, updateService, deleteService].forEach((thunk) => {
      bindMutation(builder, thunk);
    });
  },
});

export const selectServices = (state) => state.services;
export default servicesSlice.reducer;
