import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authReducer';
import heroReducer from './heroReducer';
import servicesReducer from './servicesReducer';
import settingsReducer from './settingsReducer';
import whyUsReducer from './whyUsReducer';
import aboutReducer from './aboutReducer';
import rolesReducer from './rolesReducer';
import adminsReducer from './adminsReducer';
import profileReducer from './profileReducer';
import messagesReducer from './messagesReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  hero: heroReducer,
  services: servicesReducer,
  settings: settingsReducer,
  whyUs: whyUsReducer,
  about: aboutReducer,
  roles: rolesReducer,
  admins: adminsReducer,
  profile: profileReducer,
  messages: messagesReducer,
});

export default rootReducer;
