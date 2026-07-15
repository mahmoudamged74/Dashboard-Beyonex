import { createSlice } from '@reduxjs/toolkit';
import { loginUser, logoutUser } from '../actions/authActions';
import { getPermissionsRaw, clearAuthSession } from '../../utils/authStorage';
import { REQUEST_STATUS } from '../types';

const loadPermissions = () => {
  try {
    const raw = getPermissionsRaw();
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    permissions: loadPermissions(),
    admin: null,
    status: REQUEST_STATUS.IDLE,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = REQUEST_STATUS.LOADING;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = REQUEST_STATUS.SUCCEEDED;
        state.permissions = action.payload.permissions;
        state.admin = action.payload.admin;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = REQUEST_STATUS.FAILED;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        clearAuthSession();
        state.permissions = [];
        state.admin = null;
      });
  },
});

export const selectPermissions = (state) => state.auth.permissions;
export default authSlice.reducer;
