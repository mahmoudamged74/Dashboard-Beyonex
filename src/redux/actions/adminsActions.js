import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudCreate, crudDelete, crudGet } from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchAdmins = createAsyncThunk(
  `${SLICE.ADMINS}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      const [adminsData, rolesData] = await Promise.all([
        crudGet(ENDPOINTS.ADMINS),
        crudGet(ENDPOINTS.ROLES),
      ]);
      return {
        admins: adminsData.admins || [],
        roles: rolesData.items || [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.admins) }
);

export const createAdmin = createAsyncThunk(
  `${SLICE.ADMINS}/create`,
  async (formData, { rejectWithValue }) => {
    try {
      return await crudCreate(ENDPOINTS.ADMINS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAdmin = createAsyncThunk(
  `${SLICE.ADMINS}/update`,
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      if (!formData.has('_method')) formData.append('_method', 'PUT');
      return await crudCreate(`${ENDPOINTS.ADMINS}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  `${SLICE.ADMINS}/delete`,
  async (id, { rejectWithValue }) => {
    try {
      return await crudDelete(`${ENDPOINTS.ADMINS}/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleAdminStatus = createAsyncThunk(
  `${SLICE.ADMINS}/toggleStatus`,
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await crudCreate(`${ENDPOINTS.ADMINS}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
