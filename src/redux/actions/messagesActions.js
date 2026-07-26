import { createAsyncThunk } from '@reduxjs/toolkit';
import { crudCreate, crudDelete, crudGet, crudUpdate } from '../crud';
import {
  createFetchCondition,
  createMessagesFetchCondition,
  parseMessagesArg,
} from '../cache';
import { ENDPOINTS, SLICE } from '../types';

export const fetchMessages = createAsyncThunk(
  `${SLICE.MESSAGES}/fetch`,
  async (arg = 1, { rejectWithValue }) => {
    const { page } = parseMessagesArg(arg);
    try {
      const data = await crudGet(`${ENDPOINTS.MESSAGES}?page=${page}`);
      return {
        page,
        messages: data.messages || [],
        pagination: data.pagination || { current_page: 1, last_page: 1, total: 0 },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createMessagesFetchCondition }
);

export const markMessageRead = createAsyncThunk(
  `${SLICE.MESSAGES}/markRead`,
  async ({ id, read = true }, { rejectWithValue }) => {
    try {
      await crudUpdate(`${ENDPOINTS.MESSAGES}/${id}`, { read });
      return { id, read: Boolean(read) };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  `${SLICE.MESSAGES}/delete`,
  async (id, { rejectWithValue }) => {
    try {
      return await crudDelete(`${ENDPOINTS.MESSAGES}/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
