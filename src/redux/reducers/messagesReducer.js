import { createSlice } from '@reduxjs/toolkit';
import {
  deleteMessage,
  fetchMessages,
  markMessageRead,
} from '../actions/messagesActions';
import { isMessagesPayloadUnchanged } from '../cache';
import { bindFetch, bindMutation, createEntityState } from './helpers';

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    ...createEntityState(),
    byPage: {},
    currentPage: 1,
    refreshing: false,
  },
  reducers: {
    setMessagesPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    bindFetch(
      builder,
      fetchMessages,
      (state, payload) => {
        state.byPage[payload.page] = {
          messages: payload.messages,
          pagination: payload.pagination,
        };
        if (payload.page === state.currentPage) {
          state.data = state.byPage[payload.page];
        }
      },
      isMessagesPayloadUnchanged,
    );
    bindMutation(builder, markMessageRead, (state, action) => {
      const id = action.meta?.arg?.id;
      if (id) {
        Object.values(state.byPage).forEach((pageData) => {
          const msg = pageData?.messages?.find((m) => m.id === id);
          if (msg) msg.read = true;
        });
      }
    });
    bindMutation(builder, deleteMessage);
  },
});

export const { setMessagesPage } = messagesSlice.actions;
export const selectMessages = (state) => state.messages;
export default messagesSlice.reducer;
