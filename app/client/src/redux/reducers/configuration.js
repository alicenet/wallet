import { CONFIG_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from '../../log/logHelper';

//  Any user editable and saveable configurations are loaded here
export const initialConfigurationState = {
    defaultCurve: "secp256k1", // User preferred curve to use when generating wallets
    ethereum_provider: "testnet.eth.mnexplore.com", // Ethereum RPC endpoint
    mad_net_chainID: "66", // Chain ID to use on MadNet
    mad_net_provider: "https://testnet.edge.mnexplore.com/v1/", // MadNet API endpoint
    registry_contract_address: "0x70c43ed0989fc0f50772d6a949cb0470753ae486", // Contract address for Registry Contract
}

/* Modal Reducer */
export default function configurationReducer(state = initialConfigurationState, action) {

    switch (action.type) {

        case CONFIG_ACTION_TYPES.TOGGLE_DEFAULT_CURVE:
            return Object.assign({}, state, {
                default_curve: state.default_curve === "secp256k1" ? "barreto-naehrig" : "secp256k1",
            });

        case CONFIG_ACTION_TYPES.UPDATE_ETHEREUM_PROVIDER:
            return Object.assign({}, state, {
                ethereum_provider: action.payload
            });

        case CONFIG_ACTION_TYPES.UPDATE_MAD_NET_CHAIN_ID:
            return Object.assign({}, state, {
                mad_net_chainID: action.payload
            });

        case CONFIG_ACTION_TYPES.UPDATE_MAD_NET_PROVIDER:
            return Object.assign({}, state, {
                mad_net_provider: action.payload
            });

        case CONFIG_ACTION_TYPES.UPDATE_REGISTRY_CONTRACT_ADDR:
            return Object.assign({}, state, {
                registry_contract_address: action.payload
            });

        case CONFIG_ACTION_TYPES.LOAD_DEFAULT_VALUES:
            log.debug(["Loading configuration default values:"]);
            return Object.assign({}, state, {
                mad_net_chainID: initialConfigurationState.mad_net_chainID,
                mad_net_provider: initialConfigurationState.mad_net_provider,
                ethereum_provider: initialConfigurationState.ethereum_provider,
                registry_contract_address: initialConfigurationState.registry_contract_address,
            });

        case CONFIG_ACTION_TYPES.SAVE_CONFIGURATION:
            log.debug("Saving new configuration values:", action.payload);
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