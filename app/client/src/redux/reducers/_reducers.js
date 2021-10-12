import { combineReducers } from 'redux';
// Reducers
import adapterReducer from './adapters';
import configReducer from './configuration';
import interfaceReducer from './interface';
import modalReducer from './modals';
import userReducer from './user';
import vaultReducer from './vault';

/* Setup Root Reducer */
export default combineReducers({
    adapter: adapterReducer,
    config: configReducer,
    interface: interfaceReducer,
    modal: modalReducer,
    user: userReducer,
    vault: vaultReducer,
})

