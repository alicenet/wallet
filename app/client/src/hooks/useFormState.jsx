import React from 'react';

/** Returns an object with getters and setters for each state as needed following a {value: "", error: ""} key paradigm for each passed key string
 * @param {Array} initialStateKeysArray - List of objects to create get/setters for
 * @returns {Object} -- Returns an object composed of the values of the respective passed keys including: set<KEY>, set<KEY>Error and clear<KEY>Error as state functions
 */
export default function useFormState(initialStateKeysArray) {
    // Initial State
    let initialState = {};

    // Extrapolate keys from initial state array and populate with value && error sub-keys
    initialStateKeysArray.forEach(key => {
        initialState[key.name] = { error: '', value: key.value, validated: false}
    })

    // Setup state blob
    const [formState, setFormState] = React.useState(initialState)

    // Build setters for each key and return as set[KEY]Value && set[KEY]error
    let setters = {};
    initialStateKeysArray.forEach(key => {
        // Capitalize first name of function key
        let keyCap = key.name.split('')[0].toUpperCase();
        let restOfKey = key.name.slice(1, key.name.length);
        setters["set" + keyCap + restOfKey] = (value) => setFormState(prevState => ({ ...prevState, [key.name]: { ...prevState[key.name], value: value } }));
        setters["set" + keyCap + restOfKey + "Error"] = (value) => setFormState(prevState => ({ ...prevState, [key.name]: { ...prevState[key.name], error: value } }));
        setters["clear" + keyCap + restOfKey + "Error"] = () => setFormState(prevState => ({ ...prevState, [key.name]: { ...prevState[key.name], error: "" } }));
    });

    // Return it all
    return [formState, setters];
}