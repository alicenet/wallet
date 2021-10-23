import { adapterActionTypes } from './adapters';
import { configActionTypes } from './configuration';
import { interfaceActionTypes } from './interface';
import { middlewareActionTypes } from './middleware';
import { modalActionTypes } from './modals';
import { userActionTypes } from './user';
import { transactionActionTypes } from './transaction';
import { vaultActionTypes } from './vault';

export const ADAPTER_ACTION_TYPES = { ...adapterActionTypes };
export const CONFIG_ACTION_TYPES = { ...configActionTypes };
export const INTERFACE_ACTION_TYPES = { ...interfaceActionTypes };
export const MIDDLEWARE_ACTION_TYPES = { ...middlewareActionTypes };
export const MODAL_ACTION_TYPES = { ...modalActionTypes };
export const USER_ACTION_TYPES = { ...userActionTypes };
export const TRANSACTION_ACTION_TYPES = { ...transactionActionTypes };
export const VAULT_ACTION_TYPES = { ...vaultActionTypes };