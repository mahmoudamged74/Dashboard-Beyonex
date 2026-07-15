import { createSlice } from '@reduxjs/toolkit';
import {
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  toggleAdminStatus,
  updateAdmin,
} from '../actions/adminsActions';
import { bindFetch, bindMutation, createEntityState } from './helpers';

const adminsSlice = createSlice({
  name: 'admins',
  initialState: {
    ...createEntityState(),
    data: { admins: [], roles: [] },
    refreshing: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    bindFetch(builder, fetchAdmins, (state, payload) => {
      state.data = payload;
    });
    [createAdmin, updateAdmin, deleteAdmin, toggleAdminStatus].forEach((thunk) => {
      bindMutation(builder, thunk);
    });
  },
});

export const selectAdmins = (state) => state.admins;
export default adminsSlice.reducer;
