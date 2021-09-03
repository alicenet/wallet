import * as configActions from './configuration';
import * as interfaceActions from './interface';
import * as modalActions from './modals';
import * as userActions from './user';
import * as vaultActions from './vault';

export const CONFIG_ACTIONS = { ...configActions };
export const INTERFACE_ACTIONS = { ...interfaceActions };
export const MODAL_ACTIONS = { ...modalActions };
export const USER_ACTIONS = { ...userActions };
export const VAULT_ACTIONS = { ...vaultActions };