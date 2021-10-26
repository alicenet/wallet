import { combineReducers } from 'redux';
// Reducers
import adapterReducer from './adapter';
import configReducer from './configuration';
import interfaceReducer from './interface';
import modalReducer from './modal';
import userReducer from './user';
import transactionReducer from './transaction';
import vaultReducer from './vault';

/* Setup Root Reducer */
export default combineReducers({
    adapter: adapterReducer,
    config: configReducer,
    interface: interfaceReducer,
    modal: modalReducer,
    user: userReducer,
    vault: vaultReducer,
    transaction: transactionReducer,
})

