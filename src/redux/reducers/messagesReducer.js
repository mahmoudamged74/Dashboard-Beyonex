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
    bindMutation(builder, markMessageRead, (state, payload) => {
      const id = payload?.id;
      const read = Boolean(payload?.read);
      if (id == null) return;

      Object.values(state.byPage).forEach((pageData) => {
        const msg = pageData?.messages?.find((m) => String(m.id) === String(id));
        if (msg) msg.read = read;
      });

      if (state.data?.messages) {
        const msg = state.data.messages.find((m) => String(m.id) === String(id));
        if (msg) msg.read = read;
      }
    });
    bindMutation(builder, deleteMessage);
  },
});

export const { setMessagesPage } = messagesSlice.actions;
export const selectMessages = (state) => state.messages;
export default messagesSlice.reducer;
