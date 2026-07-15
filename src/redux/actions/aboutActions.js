import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  crudCreate,
  crudDelete,
  crudGet,
  crudOperation,
  crudUpdate,
  crudUpdateForm,
} from '../crud';
import { createFetchCondition } from '../cache';
import { ENDPOINTS, SLICE } from '../types';

const normalizeAboutPage = (raw, fallbackPage = null) => {
  const page = raw?.about_page ?? raw;
  if (!page || typeof page !== 'object') return page;
  const fallback = fallbackPage?.about_page ?? fallbackPage;
  return {
    ...page,
    logo_path:
      page.logo_path ||
      page.logo ||
      fallback?.logo_path ||
      fallback?.logo ||
      '',
  };
};

export const fetchAboutData = createAsyncThunk(
  `${SLICE.ABOUT}/fetch`,
  async (_, { rejectWithValue }) => {
    try {
      const [
        aboutData,
        heroFeaturesData,
        milestonesData,
        achievementsData,
        coreValuesData,
        teamData,
        publicAboutData,
      ] = await Promise.all([
        crudGet(`/${ENDPOINTS.ABOUT_PAGE}`),
        crudGet(`/${ENDPOINTS.HERO_FEATURES}`),
        crudGet(`/${ENDPOINTS.MILESTONES}`),
        crudGet(`/${ENDPOINTS.ACHIEVEMENTS}`),
        crudGet(`/${ENDPOINTS.CORE_VALUES}`),
        crudGet(`/${ENDPOINTS.TEAM_MEMBERS}`),
        crudGet(ENDPOINTS.PUBLIC_ABOUT).catch(() => null),
      ]);

      return {
        aboutData: normalizeAboutPage(aboutData, publicAboutData),
        heroFeatures: heroFeaturesData.about_hero_features || [],
        milestones: milestonesData.about_milestones || [],
        achievements: achievementsData.about_achievements || [],
        coreValues: coreValuesData.about_core_values || [],
        teamMembers: teamData.team_members || [],
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
  { condition: createFetchCondition((state) => state.about) }
);

export const updateAboutPage = createAsyncThunk(
  `${SLICE.ABOUT}/updatePage`,
  async (payload, { rejectWithValue }) => {
    try {
      const isFormData = payload instanceof FormData;
      let result;
      if (isFormData) {
        result = await crudUpdateForm(`/${ENDPOINTS.ABOUT_PAGE}`, payload);
      } else {
        result = await crudUpdate(`/${ENDPOINTS.ABOUT_PAGE}`, payload);
      }
      const aboutPage = result.data?.about_page ?? result.data;
      return { ...result, aboutPage };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const aboutHeroFeatureAction = createAsyncThunk(
  `${SLICE.ABOUT}/heroFeature`,
  async ({ action, id, formData }, { rejectWithValue }) => {
    try {
      if (action === 'add') {
        return await crudCreate(`/${ENDPOINTS.HERO_FEATURES}`, formData);
      }
      if (action === 'edit') {
        return await crudUpdate(`/${ENDPOINTS.HERO_FEATURES}/${id}`, formData);
      }
      return await crudDelete(`/${ENDPOINTS.HERO_FEATURES}/${id}`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const aboutMilestoneAction = createAsyncThunk(
  `${SLICE.ABOUT}/milestone`,
  async ({ action, id, formData }, { rejectWithValue }) => {
    try {
      return await crudOperation({
        action,
        baseUrl: `/${ENDPOINTS.MILESTONES}`,
        id,
        payload: formData,
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const aboutAchievementAction = createAsyncThunk(
  `${SLICE.ABOUT}/achievement`,
  async ({ action, id, formData }, { rejectWithValue }) => {
    try {
      return await crudOperation({
        action,
        baseUrl: `/${ENDPOINTS.ACHIEVEMENTS}`,
        id,
        payload: formData,
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const aboutCoreValueAction = createAsyncThunk(
  `${SLICE.ABOUT}/coreValue`,
  async ({ action, id, formData }, { rejectWithValue }) => {
    try {
      return await crudOperation({
        action,
        baseUrl: `/${ENDPOINTS.CORE_VALUES}`,
        id,
        payload: formData,
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const aboutTeamAction = createAsyncThunk(
  `${SLICE.ABOUT}/team`,
  async ({ action, id, formData }, { rejectWithValue }) => {
    try {
      return await crudOperation({
        action,
        baseUrl: `/${ENDPOINTS.TEAM_MEMBERS}`,
        id,
        payload: formData,
      });
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
