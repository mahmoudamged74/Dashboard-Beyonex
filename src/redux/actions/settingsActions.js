import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudGet, crudUpdateForm } from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchSettings = createAsyncThunk(
  `${SLICE.SETTINGS}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      return await crudGet(ENDPOINTS.SETTINGS);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.settings) }
);

export const updateSettings = createAsyncThunk(
  `${SLICE.SETTINGS}/update`,
  async (body, { rejectWithValue }) => {
    try {
      return await crudUpdateForm(ENDPOINTS.SETTINGS, body);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
