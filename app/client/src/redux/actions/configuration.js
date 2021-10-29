import { electronStoreCommonActions } from 'store/electronStoreHelper';
import { CONFIG_ACTION_TYPES } from '../constants/_constants';
import { initialConfigurationState } from '../reducers/configuration'
import { reduxState_logger as log } from 'log/logHelper'

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
    return { type: CONFIG_ACTION_TYPES.UPDATE_REGISTRY_CONTRACT_ADDR, payload: newRegistryContractAddress };
}

/**
 * Load default values to every field under configuration
 * @returns null
 */
export function loadDefaultValues() {
    return async function (dispatch) {
        // Anytime we load defaults -- Make sure we update the electron store to reflect it
        electronStoreCommonActions.storeConfigurationValues(initialConfigurationState);
        dispatch({ type: CONFIG_ACTION_TYPES.LOAD_DEFAULT_VALUES });
        return true;
    }
}

/**
 * Load default values to every field under configuration
 * @prop { String } chainId - Chain ID to update settings to
 * @prop { String } madNetProvider - MadNetProvider URL to update settings to
 * @prop { String } ethProvider - EthProvider URL to update settings to
 * @prop { String } registryContractAddress - Registry Contract Address to update settings to
 * @returns { Bool || Object.error }
 */
export function saveConfigurationValues(chainId, madNetProvider, ethProvider, registryContractAddress) {
    return async function (dispatch) {
        try {
            let updateObject = {
                mad_net_chainID: chainId,
                mad_net_provider: madNetProvider,
                ethereum_provider: ethProvider,
                registry_contract_address: registryContractAddress,
            }
            // Write any config saves to the electron store and dispatch the config update
            electronStoreCommonActions.storeConfigurationValues(updateObject);
            dispatch({ type: CONFIG_ACTION_TYPES.SAVE_CONFIGURATION, payload: updateObject });
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }
}

/**
 * Load confuguration values from the store to current redux state
 * @returns 
 */
export function loadConfigurationValuesFromStore() {
    return async function (dispatch) {
        try {
            let loadedConfig = await electronStoreCommonActions.readConfigurationValues();
            if (loadedConfig.error === "Key is not in secure-electron-storage!") {
                log.debug("Configuration doesn't exist -- Using initial configuration state")
                return false;
            } else if (loadedConfig.error) {
                throw new Error(loadedConfig.error)
            }
            dispatch({ type: CONFIG_ACTION_TYPES.SAVE_CONFIGURATION, payload: loadedConfig });
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }
}