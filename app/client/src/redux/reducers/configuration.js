import { CONFIG_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from 'log/logHelper';

//  Any user editable and savable configurations are loaded here
export const initialConfigurationState = {
    ethereum_provider: "https://testnet.eth.mnexplore.com", // Ethereum RPC endpoint
    mad_net_chainID: "66", // Chain ID to use on MadNet
    mad_net_provider: "https://testnet.edge.mnexplore.com/v1/", // MadNet API endpoint
    registry_contract_address: "0x70c43ed0989fc0f50772d6a949cb0470753ae486", // Contract address for Registry Contract
}

/* Modal Reducer */
export default function configurationReducer(state = initialConfigurationState, action) {

    switch (action.type) {

        case CONFIG_ACTION_TYPES.LOAD_DEFAULT_VALUES:
            log.debug(["Loading configuration default values:"]);
            return Object.assign({}, state, {
                mad_net_chainID: initialConfigurationState.mad_net_chainID,
                mad_net_provider: initialConfigurationState.mad_net_provider,
                ethereum_provider: initialConfigurationState.ethereum_provider,
                registry_contract_address: initialConfigurationState.registry_contract_address,
            });

        case CONFIG_ACTION_TYPES.SAVE_CONFIGURATION:
            log.debug("Setting new configuration values:", action.payload);
            return Object.assign({}, state, {
                mad_net_chainID: action.payload.mad_net_chainID,
                mad_net_provider: action.payload.mad_net_provider,
                ethereum_provider: action.payload.ethereum_provider,
                registry_contract_address: action.payload.registry_contract_address,
            });

        default:
            return state;

    }

}