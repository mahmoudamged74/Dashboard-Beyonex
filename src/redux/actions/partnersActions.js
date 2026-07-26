import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudCreate, crudDelete, crudGet } from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchPartners = createAsyncThunk(
  `${SLICE.PARTNERS}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      const data = await crudGet(ENDPOINTS.PARTNERS);
      if (Array.isArray(data)) return data;
      return data?.partners || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.partners) }
);

export const createPartner = createAsyncThunk(
  `${SLICE.PARTNERS}/create`,
  async (formData, { rejectWithValue }) => {
    try {
      return await crudCreate(ENDPOINTS.PARTNERS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePartner = createAsyncThunk(
  `${SLICE.PARTNERS}/update`,
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      if (!formData.has('_method')) formData.append('_method', 'PUT');
      return await crudCreate(`${ENDPOINTS.PARTNERS}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePartner = createAsyncThunk(
  `${SLICE.PARTNERS}/delete`,
  async (id, { rejectWithValue }) => {
    try {
      return await crudDelete(`${ENDPOINTS.PARTNERS}/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const togglePartnerStatus = createAsyncThunk(
  `${SLICE.PARTNERS}/toggleStatus`,
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await crudCreate(`${ENDPOINTS.PARTNERS}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
