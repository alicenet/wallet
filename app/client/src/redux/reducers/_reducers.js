import { combineReducers } from 'redux';
// Reducers
import configReducer from './configuration';
import modalReducer from './modals';
import userReducer from './user';

/* Setup Root Reducer */
export default combineReducers({
    config: configReducer,
    modal: modalReducer,
    user: userReducer,
})

