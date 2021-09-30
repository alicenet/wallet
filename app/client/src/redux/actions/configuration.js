import { CONFIG_ACTION_TYPES } from '../constants/_constants';

/**
 * Toggle default_curve setting in configuration reducer
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function toggleDefaultCurve() {
    return { type: CONFIG_ACTION_TYPES.TOGGLE_DEFAULT_CURVE }
}

/**
 * Update ethereum_provider within the configuration reducer
 * @param { String } newEthereumProviderEndpoint - New RPC endpoint as a string
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function updateEthereumProvider(newEthereumProviderEndpoint) {
    return { type: CONFIG_ACTION_TYPES.UPDATE_ETHEREUM_PROVIDER, payload: newEthereumProviderEndpoint };
}

/**
 * Update madNetChainId within the configuration reducer
 * @param { String } mad_net_chainID - New MadNetChainId as a string
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function updateMadNetChainId(newMadNetChainId) {
    return { type: CONFIG_ACTION_TYPES.UPDATE_MAD_NET_CHAIN_ID, payload: newMadNetChainId };
}

/**
 * Update mad_net_provider within the configuration reducer
 * @param { String } newMadNetProvider - New MadNetProvider endpoint as a string
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function updateMadNetProvider(newMadNetProvider) {
    return { type: CONFIG_ACTION_TYPES.UPDATE_MAD_NET_PROVIDER, payload: newMadNetProvider };
}

/**
 * Update registry_contract_address within the configuration reducer
 * @param { String } newRegistryContractAddress - New RegistryContractAddress as a string
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function updateRegistryContractAddress(newRegistryContractAddress) {
    return { type: CONFIG_ACTION_TYPES.TOGGLE_DEFAULT_CURVE };
}

/**
 * Load default values to every field under configuration
 * @returns null
 */
export function loadDefaultValues() {
    return async function (dispatch) {
        dispatch({ type: CONFIG_ACTION_TYPES.LOAD_DEFAULT_VALUES });
    }
}

/**
 * Load default values to every field under configuration
 * @prop { String } chainId - Chain ID to update settings to
 * @prop { String } madNetProvider - MadNetProvider URL to update settings to
 * @prop { String } ethProvider - EthProvider URL to update settings to
 * @prop { String } registryContractAddress - Registry Contract Address to update settings to
 * @returns null
 */
 export function saveConfigurationValues(chainId, madNetProvider, ethProvider, registryContractAddress) {
    return async function (dispatch) {
        dispatch({ type: CONFIG_ACTION_TYPES.SAVE_CONFIGURATION, payload: {
            mad_net_chainID: chainId,
            mad_net_provider: madNetProvider,
            ethereum_provider: ethProvider,
            registry_contract_address: registryContractAddress,
        } });
    }
}
