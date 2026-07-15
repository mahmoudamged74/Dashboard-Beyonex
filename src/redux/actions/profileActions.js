import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudCreate, crudGet } from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchProfile = createAsyncThunk(
  `${SLICE.PROFILE}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      return await crudGet(ENDPOINTS.PROFILE);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.profile) }
);

export const updateProfile = createAsyncThunk(
  `${SLICE.PROFILE}/update`,
  async (formData, { rejectWithValue }) => {
    try {
      const isFormData = formData instanceof FormData;
      if (isFormData && !formData.has('_method')) {
        formData.append('_method', 'PUT');
      }
      return await crudCreate(ENDPOINTS.PROFILE, formData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
