import React from 'react';

/** Returns an object with getters and setters for each state as needed following a {value: "", error: ""} key paradigm for each passed key string
 * @param {Array} initialStateKeysArray - List of keys as strings to create get/setters for
 * @returns {Object} -- Returns an object composed of the values of the respective passed keys including: set<KEY>, set<KEY>Error and clear<KEY>Error as state functions
 */
export default function useFormState(initialStateKeysArray) {
    // Initial State
    let initialState = {};
    // Extrapolate keys from initial state array and populate with value && error sub-keys
    initialStateKeysArray.forEach(key => {
        initialState[key] = { error: "", value: "" }
    })
    // Setup state blob
    const [formState, setFormState] = useStateCallback(initialState)
    // Build setters for each key and return as set[KEY]Value && set[KEY]error
    let setters = {};
    initialStateKeysArray.forEach(key => {
        // Capitalize first name of function key 
        let keyCap = key.split('')[0].toUpperCase();
        let restOfKey = key.slice(1, key.length);
        setters["set" + keyCap + restOfKey] = (value, callback) => setFormState(prevState => ({ ...prevState, [key]: { ...prevState[key], value: value } }), (state) => callback && callback(state));
        setters["set" + keyCap + restOfKey + "Error"] = (value) => setFormState(prevState => ({ ...prevState, [key]: { ...prevState[key], error: value } }));
        setters["clear" + keyCap + restOfKey + "Error"] = () => setFormState(prevState => ({ ...prevState, [key]: { ...prevState[key], error: "" } }));
    });
    // Return it all
    return [formState, setters];
}

function useStateCallback(initialState) {
    const [state, setState] = React.useState(initialState);
    const cbRef = React.useRef(null);

    const setStateCallback = React.useCallback((state, cb) => {
        cbRef.current = cb;
        setState(state);
    }, []);

    React.useEffect(() => {
        if (cbRef.current) {
            cbRef.current(state);
            cbRef.current = null;
        }
    }, [state]);

    return [state, setStateCallback];
}