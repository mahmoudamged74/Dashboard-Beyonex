import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudCreate, crudDelete, crudGet } from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchWhyUs = createAsyncThunk(
  `${SLICE.WHY_US}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await crudGet(ENDPOINTS.WHY_US);
      return data.why_us || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.whyUs) }
);

export const createWhyUs = createAsyncThunk(
  `${SLICE.WHY_US}/create`,
  async (formData, { rejectWithValue }) => {
    try {
      return await crudCreate(ENDPOINTS.WHY_US, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateWhyUs = createAsyncThunk(
  `${SLICE.WHY_US}/update`,
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      if (!formData.has('_method')) formData.append('_method', 'PUT');
      return await crudCreate(`${ENDPOINTS.WHY_US}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteWhyUs = createAsyncThunk(
  `${SLICE.WHY_US}/delete`,
  async (id, { rejectWithValue }) => {
    try {
      return await crudDelete(`${ENDPOINTS.WHY_US}/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleWhyUsStatus = createAsyncThunk(
  `${SLICE.WHY_US}/toggleStatus`,
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await crudCreate(`${ENDPOINTS.WHY_US}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
