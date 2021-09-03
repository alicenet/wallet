import { configActionTypes } from './configuration';
import { interfaceActionTypes } from './interface';
import { modalActionTypes } from './modals';
import { userActionTypes } from './user';
import { vaultActionTypes } from './vault';

export const CONFIG_ACTION_TYPES = { ...configActionTypes }
export const INTERFACE_ACTION_TYPES = { ...interfaceActionTypes }
export const MODAL_ACTION_TYPES = { ...modalActionTypes };
export const USER_ACTION_TYPES = { ...userActionTypes };
export const VAULT_ACTION_TYPES = { ...vaultActionTypes };