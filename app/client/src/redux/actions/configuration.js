import { electronStoreCommonActions } from 'store/electronStoreHelper';
import { ADAPTER_ACTION_TYPES, CONFIG_ACTION_TYPES } from 'redux/constants/_constants';
import { reduxState_logger as log } from 'log/logHelper'
import { useFallbackValueForUndefinedInput } from 'util/generic';
import { initialConfigurationState } from 'redux/reducers/configuration';

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
 * @returns { Bool | Object.error }
 */
export function saveConfigurationValues({ chainId, madNetProvider, ethProvider, registryContractAddress, enableAdvancedSettings, hideGenericTooltips }) {
    return async function (dispatch, getState) {
        let currentConfig = getState().config;
        try {
            let updateObject = {
                mad_net_chainID: useFallbackValueForUndefinedInput(chainId, currentConfig.mad_net_chainID),
                mad_net_provider: useFallbackValueForUndefinedInput(madNetProvider, currentConfig.mad_net_provider),
                ethereum_provider: useFallbackValueForUndefinedInput(ethProvider, currentConfig.ethereum_provider),
                registry_contract_address: useFallbackValueForUndefinedInput(registryContractAddress, currentConfig.registry_contract_address),
                advanced_settings: useFallbackValueForUndefinedInput(enableAdvancedSettings, currentConfig.advanced_settings),
                hide_generic_tooltips: useFallbackValueForUndefinedInput(hideGenericTooltips, currentConfig.hide_generic_tooltips),
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
 * Load configuration values from the store to current redux state
 * @returns { Bool | Object }
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
            dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_ERROR, payload: false });
            dispatch({ type: ADAPTER_ACTION_TYPES.SET_MADNET_ERROR, payload: false });
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }
}