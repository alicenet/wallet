import React from 'react';
import upperFirst from 'lodash/upperFirst';
import isEmpty from 'validator/lib/isEmpty';
import Web3 from 'web3';
import isURL from "validator/lib/isURL";

export const fieldType = {
    URL: 'url',
    PASSWORD: 'password',
    VERIFIED_PASSWORD: 'verified-password',
    INTEGER: 'integer',
    ADDRESS: 'address',
}

/** Returns an object with getters and setters for each state as needed following a {value: "", error: ""} key paradigm for each passed key string
 * @param {Array} initialStateKeysArray - List of objects to create get/setters for
 * @typedef {Object} FormStateReturn
 * @property {Object} formState - Object containing the form values
 * @property {Object} setters - Object containing the respective set functions named as set[key.name]()
 * @property {Function} onSubmit - Function to call when successful form submission has occurred
 * @returns {FormStateReturn} - Returns an object composed of the values of the respective passed keys including: set<KEY>, set<KEY>Error and clear<KEY>Error as state functions
 */
export default function useFormState(initialStateKeysArray) {
    // Initial State
    let initialState = {};

    // Extrapolate keys from initial state array and populate with value && error sub-keys
    initialStateKeysArray.forEach(key => {
        initialState[key.name] = { ...key, error: '' }
    })

    // Setup state blob
    const [formState, setFormState] = React.useState(initialState)

    // Build setters for each key and return as set[KEY]Value && set[KEY]error
    let setters = {};
    initialStateKeysArray.forEach(key => {
        // Capitalize first name of function key
        const keyName = upperFirst(key.name);

        setters["set" + keyName] = (value) => setFormState(prevState => ({ ...prevState, [key.name]: { ...prevState[key.name], value, error: '' } }));
        setters["set" + keyName + "Error"] = (value) => setFormState(prevState => ({ ...prevState, [key.name]: { ...prevState[key.name], error: value } }));
        setters["clear" + keyName + "Error"] = () => setFormState(prevState => ({ ...prevState, [key.name]: { ...prevState[key.name], error: '' } }));
    });

    const onSubmit = (callback) => {
        let errorsFound = false;
        initialStateKeysArray.forEach(key => {
            let error = "";
            if (key.validation) {
                if (!key.validation.check(formState[key.name].value)) {
                    error = key.validation.message;
                }
            }
            else {
                if (formState[key.name].isRequired && isEmpty(formState[key.name].value)) {
                    error = (formState[key.name].display || formState[key.name].name) + " is required";
                }
                else {
                    switch (formState[key.name].type) {
                        case fieldType.URL:
                            if (!isURL(formState[key.name].value, { protocols: ['http', 'https'] })) {
                                error = (formState[key.name].display || formState[key.name].name) + " is not a valid HTTP URL";
                            }
                            break;
                        case fieldType.INTEGER:
                            if (isNaN(formState[key.name].value)) {
                                error = (formState[key.name].display || formState[key.name].name) + " is not a valid number";
                            }
                            break;
                        case fieldType.ADDRESS:
                            if (!Web3.utils.isAddress(formState[key.name].value)) {
                                error = (formState[key.name].display || formState[key.name].name) + " is not a valid address";
                            }
                            break;
                        case fieldType.PASSWORD:
                            if (formState[key.name].value.length < 8) {
                                error = (formState[key.name].display || formState[key.name].name) + " must be at least 8 characters long.";
                            }
                            break;
                        case fieldType.VERIFIED_PASSWORD:
                            if (formState[key.name].value !== formState['password'].value) {
                                error = "Passwords do not match.";
                            }
                            break;
                        default:
                            break;
                    }
                }
            }

            const keyName = upperFirst(key.name);
            if (error) {
                setters['set' + keyName + 'Error'](error);
                errorsFound |= true;
            }
            else {
                setters['clear' + keyName + 'Error']();
            }

        });

        if (!errorsFound) {
            callback();
        }
    };

    // Return it all
    return [formState, setters, onSubmit];
}