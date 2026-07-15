import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudCreate, crudDelete, crudGet } from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchServices = createAsyncThunk(
  `${SLICE.SERVICES}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await crudGet(ENDPOINTS.SERVICES);
      const services = data.services || [];
      services.sort(
        (a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0)
      );
      return services;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.services) }
);

export const createService = createAsyncThunk(
  `${SLICE.SERVICES}/create`,
  async (formData, { rejectWithValue }) => {
    try {
      const result = await crudCreate(ENDPOINTS.SERVICES, formData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateService = createAsyncThunk(
  `${SLICE.SERVICES}/update`,
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      if (!formData.has('_method')) formData.append('_method', 'PUT');
      const result = await crudCreate(`${ENDPOINTS.SERVICES}/${id}`, formData);
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  `${SLICE.SERVICES}/delete`,
  async (id, { rejectWithValue }) => {
    try {
      return await crudDelete(`${ENDPOINTS.SERVICES}/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
