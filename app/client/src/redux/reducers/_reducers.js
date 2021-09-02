import { combineReducers } from 'redux';
// Reducers
import configReducer from './configuration';
import interfaceReducer from './interface';
import modalReducer from './modals';
import userReducer from './user';
import vaultReducer from './vault';

/* Setup Root Reducer */
export default combineReducers({
    config: configReducer,
    interface: interfaceReducer,
    modal: modalReducer,
    user: userReducer,
    vault: vaultReducer,
})

