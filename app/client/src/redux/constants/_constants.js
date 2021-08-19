import { configActionTypes } from './configuration';
import { modalActionTypes } from './modals';
import { userActionTypes } from './user';

export const CONFIG_ACTION_TYPES = { ...configActionTypes }
export const MODAL_ACTION_TYPES = { ...modalActionTypes };
export const USER_ACTION_TYPES = { ...userActionTypes };