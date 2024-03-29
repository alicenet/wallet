import { electronStoreCommonActions } from 'store/electronStoreHelper';
import { ADAPTER_ACTION_TYPES, CONFIG_ACTION_TYPES } from 'redux/constants/_constants';
import { reduxState_logger as log } from 'log/logHelper'
import { useFallbackValueForUndefinedInput } from 'util/generic';
import { initialConfigurationState, envConfigurationState } from 'redux/reducers/configuration';

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
 * Load env values to fields under configuration
 * @returns null
 */
 export function loadEnvValues() {
    return async function (dispatch) {
        // Anytime we load defaults -- Make sure we update the electron store to reflect it
        electronStoreCommonActions.storeConfigurationValues(envConfigurationState);
        dispatch({ type: CONFIG_ACTION_TYPES.LOAD_ENV_VALUES });
        return true;
    }
}

/**
 * Load default values to every field under configuration
 * @prop { String } chainId - Chain ID to update settings to
 * @prop { String } aliceNetProvider - AliceNetProvider URL to update settings to
 * @prop { String } ethProvider - EthProvider URL to update settings to
 * @prop { String } registryContractAddress - Registry Contract Address to update settings to
 * @returns { Bool | Object.error }
 */
export function saveConfigurationValues({ chainId, aliceNetProvider, ethProvider, registryContractAddress, enableAdvancedSettings, hideGenericTooltips, hasSeenTxHelpModal }) {
    return async function (dispatch, getState) {
        let currentConfig = getState().config;
        try {
            let updateObject = {
                alice_net_chainID: useFallbackValueForUndefinedInput(chainId, currentConfig.alice_net_chainID),
                alice_net_provider: useFallbackValueForUndefinedInput(aliceNetProvider, currentConfig.alice_net_provider),
                ethereum_provider: useFallbackValueForUndefinedInput(ethProvider, currentConfig.ethereum_provider),
                registry_contract_address: useFallbackValueForUndefinedInput(registryContractAddress, currentConfig.registry_contract_address),
                advanced_settings: useFallbackValueForUndefinedInput(enableAdvancedSettings, currentConfig.advanced_settings),
                hide_generic_tooltips: useFallbackValueForUndefinedInput(hideGenericTooltips, currentConfig.hide_generic_tooltips),
                has_seen_tx_help_modal: useFallbackValueForUndefinedInput(hasSeenTxHelpModal, currentConfig.has_seen_tx_help_modal),
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
            dispatch({ type: ADAPTER_ACTION_TYPES.SET_ALICENET_ERROR, payload: false });
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }
}