//TODO:: => // import { ADAPTER_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from '../../log/logHelper';

//  Any user editable and saveable configurations are loaded here
export const initialAdapterState = {
    web3Adapter: {
        connected: false,
        error: false,
    },
    madNetAdapter: {
        connected: false,
        error: false,
    }
}

/* Modal Reducer */
export default function configurationReducer(state = initialConfigurationState, action) {

    switch (action.type) {

        case "TBD":
            return Object.assign({}, state, {} );

        default:
            return state;

    }

}