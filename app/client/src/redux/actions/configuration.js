import { CONFIG_ACTION_TYPES } from '../constants/_constants';

/**
 * Toggle default_curve setting in configuration reducer
 * @returns { Object } - Action object to be passed as first paramater within Redux.dispatch()
 */
export function toggleDefaultCurve() {
    return { type: CONFIG_ACTION_TYPES.TOGGLE_DEFAULT_CURVE }
}

/**
 * Update ethereum_provider within the configuration reducer
 * @param { String } newEthereumProviderEndpoint - New RPC endpoint as a string
 * @returns { Object } - Action object to be passed as first paramater within Redux.dispatch()
 */
export function updateEthereumProvider(newEthereumProviderEndpoint) {
    return { type: CONFIG_ACTION_TYPES.UPDATE_ETHEREUM_PROVIDER, payload: newEthereumProviderEndpoint };
}

/**
 * Update madNetChainId within the configuration reducer
 * @param { String } mad_net_chainID - New MadNetChainId as a string
 * @returns { Object } - Action object to be passed as first paramater within Redux.dispatch()
 */
export function updateMadNetChainId(newMadNetChainId) {
    return { type: CONFIG_ACTION_TYPES.UPDATE_MAD_NET_CHAIN_ID, payload: newMadNetChainId };
}

/**
 * Update mad_net_provider within the configuration reducer
 * @param { String } newMadNetProvider - New MadNetProvider endpoint as a string
 * @returns { Object } - Action object to be passed as first paramater within Redux.dispatch()
 */
export function updateMadNetProvider(newMadNetProvider) {
    return { type: CONFIG_ACTION_TYPES.UPDATE_MAD_NET_PROVIDER, payload: newMadNetProvider };
}

/**
 * Update registry_contract_address within the configuration reducer
 * @param { String } newRegistryContractAddress - New RegistryContractAddress as a string
 * @returns { Object } - Action object to be passed as first paramater within Redux.dispatch()
 */
export function updateRegistryContractAddress(newRegistryContractAddress) {
    return { type: CONFIG_ACTION_TYPES.TOGGLE_DEFAULT_CURVE };
}