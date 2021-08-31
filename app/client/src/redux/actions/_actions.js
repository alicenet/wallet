import * as configActions from './configuration';
import * as interfaceActions from './interface';
import * as modalActions from './modals';
import * as userActions from './user';

export const CONFIG_ACTIONS = { ...configActions };
export const INTERFACE_ACTIONS = { ...interfaceActions };
export const MODAL_ACTIONS = { ...modalActions };
export const USER_ACTIONS = { ...userActions };
