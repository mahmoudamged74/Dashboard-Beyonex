import { createSlice } from '@reduxjs/toolkit';
import {
  createRole,
  deleteRole,
  fetchRoles,
  updateRole,
} from '../actions/rolesActions';
import { bindFetch, bindMutation, createEntityState } from './helpers';

const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    ...createEntityState(),
    data: { roles: [], permissions: [] },
    refreshing: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    bindFetch(builder, fetchRoles, (state, payload) => {
      state.data = payload;
    });
    [createRole, updateRole, deleteRole].forEach((thunk) => {
      bindMutation(builder, thunk);
    });
  },
});

export const selectRoles = (state) => state.roles;
export default rolesSlice.reducer;
