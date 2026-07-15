import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudCreate, crudDelete, crudGet, crudUpdate } from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchRoles = createAsyncThunk(
  `${SLICE.ROLES}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        crudGet(ENDPOINTS.ROLES),
        crudGet(ENDPOINTS.ROLE_PERMISSIONS),
      ]);
      return {
        roles: rolesData.items || [],
        permissions: permissionsData || [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.roles) }
);

export const fetchRoleById = createAsyncThunk(
  `${SLICE.ROLES}/fetchById`,
  async (id, { rejectWithValue }) => {
    try {
      return await crudGet(`${ENDPOINTS.ROLES}/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRole = createAsyncThunk(
  `${SLICE.ROLES}/create`,
  async (formData, { rejectWithValue }) => {
    try {
      return await crudCreate(ENDPOINTS.ROLES, formData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRole = createAsyncThunk(
  `${SLICE.ROLES}/update`,
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await crudUpdate(`${ENDPOINTS.ROLES}/${id}`, formData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRole = createAsyncThunk(
  `${SLICE.ROLES}/delete`,
  async (id, { rejectWithValue }) => {
    try {
      return await crudDelete(`${ENDPOINTS.ROLES}/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
