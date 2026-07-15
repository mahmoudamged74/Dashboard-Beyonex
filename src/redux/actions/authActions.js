import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudCreate } from '../crud';
import { ENDPOINTS, SLICE } from '../types';
import { saveAuthSession } from '../../utils/authStorage';

export const loginUser = createAsyncThunk(
  `${SLICE.AUTH}/login`,
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const result = await crudCreate(ENDPOINTS.LOGIN, { email, password });
      const token = result.data?.token;
      const admin = result.data?.admin;
      const rawPermissions = admin?.role?.permissions || admin?.permissions || [];
      const permissions = rawPermissions.map((p) =>
        typeof p === 'string' ? p : p.key
      );

      saveAuthSession({
        token,
        permissions,
        rememberMe,
        email: email.trim(),
      });

      return { permissions, admin };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  `${SLICE.AUTH}/logout`,
  async (_, { rejectWithValue }) => {
    try {
      await crudCreate(ENDPOINTS.LOGOUT, {});
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
