import { createSlice } from '@reduxjs/toolkit';
import {
  aboutAchievementAction,
  aboutCoreValueAction,
  aboutHeroFeatureAction,
  aboutMilestoneAction,
  aboutTeamAction,
  fetchAboutData,
  updateAboutPage,
} from '../actions/aboutActions';
import { bindFetch, bindMutation, createEntityState } from './helpers';

const aboutSlice = createSlice({
  name: 'about',
  initialState: {
    ...createEntityState(),
    data: null,
    refreshing: false,
  },
  reducers: {
    mergeAboutPage: (state, action) => {
      const aboutPage = action.payload;
      if (!aboutPage || !state.data) return;
      state.data = {
        ...state.data,
        aboutData: {
          ...state.data.aboutData,
          ...aboutPage,
          logo_path: aboutPage.logo_path || aboutPage.logo || state.data.aboutData?.logo_path || '',
        },
      };
    },
  },
  extraReducers: (builder) => {
    bindFetch(builder, fetchAboutData, (state, payload) => {
      state.data = payload;
    });
    bindMutation(builder, updateAboutPage, (state, action) => {
      const aboutPage = action.payload?.aboutPage;
      if (aboutPage && state.data) {
        state.data = {
          ...state.data,
          aboutData: { ...state.data.aboutData, ...aboutPage },
        };
      }
    });
    [
      aboutHeroFeatureAction,
      aboutMilestoneAction,
      aboutAchievementAction,
      aboutCoreValueAction,
      aboutTeamAction,
    ].forEach((thunk) => bindMutation(builder, thunk));
  },
});

export const { mergeAboutPage } = aboutSlice.actions;
export const selectAbout = (state) => state.about;
export default aboutSlice.reducer;
