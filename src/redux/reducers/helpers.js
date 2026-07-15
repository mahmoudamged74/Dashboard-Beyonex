import { REQUEST_STATUS } from '../types';
import { sliceHasData } from '../cache';

export const createListState = (initial = []) => ({
  items: initial,
  status: REQUEST_STATUS.IDLE,
  saving: false,
  refreshing: false,
  error: null,
  lastUpdated: null,
});

export const createEntityState = (initial = null) => ({
  data: initial,
  status: REQUEST_STATUS.IDLE,
  saving: false,
  refreshing: false,
  error: null,
  lastUpdated: null,
});

export const bindFetch = (builder, thunk, mapPayload, isUnchanged) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.error = null;
      state.refreshing = true;
      if (!sliceHasData(state)) {
        state.status = REQUEST_STATUS.LOADING;
      }
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.status = REQUEST_STATUS.SUCCEEDED;
      state.refreshing = false;

      if (isUnchanged?.(state, action.payload)) {
        return;
      }

      mapPayload(state, action.payload);
      state.lastUpdated = Date.now();
    })
    .addCase(thunk.rejected, (state, action) => {
      state.refreshing = false;
      if (!sliceHasData(state)) {
        state.status = REQUEST_STATUS.FAILED;
      }
      state.error = action.payload || action.error?.message;
    });
};

export const bindMutation = (builder, thunk, onSuccess) => {
  builder
    .addCase(thunk.pending, (state) => {
      state.saving = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, action) => {
      state.saving = false;
      onSuccess?.(state, action.payload);
      state.lastUpdated = Date.now();
    })
    .addCase(thunk.rejected, (state, action) => {
      state.saving = false;
      state.error = action.payload || action.error?.message;
    });
};
