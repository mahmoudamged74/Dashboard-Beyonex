import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudGet, crudPutForm, crudUpdateForm } from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchHeroSection = createAsyncThunk(
  `${SLICE.HERO}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      return await crudGet(ENDPOINTS.HERO);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.hero) }
);

export const updateHeroSection = createAsyncThunk(
  `${SLICE.HERO}/update`,
  async (formData, { rejectWithValue }) => {
    try {
      const hasFile = formData instanceof FormData && [...formData.entries()].some(
        ([, value]) => value instanceof File
      );

      // API spec: PUT + multipart. Prefer POST+_method when uploading files (PHP/Laravel).
      if (hasFile) {
        if (formData instanceof FormData && !formData.has('_method')) {
          formData.append('_method', 'PUT');
        }
        return await crudUpdateForm(ENDPOINTS.HERO, formData);
      }

      if (formData instanceof FormData && formData.has('_method')) {
        formData.delete('_method');
      }
      return await crudPutForm(ENDPOINTS.HERO, formData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
