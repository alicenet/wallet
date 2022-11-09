import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import walletManagerMiddleware from "../middleware/WalletManagerMiddleware";
import vaultUpdateManagerMiddleware from "../middleware/VaultUpdateManagerMiddleware";
import rootReducer from "../reducers/_reducers";

const middleware = applyMiddleware(
    thunk,
    walletManagerMiddleware,
    vaultUpdateManagerMiddleware
);

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(rootReducer, composeEnhancers(middleware));

export default store;
