import React from 'react';

/**
 * Return React.useState() functionality with a toggler function that accepts on override
 * @param {*} initialState - Initial state that useState should set to
 * @returns {Array} - [<Boolean> currentBoolState, <Function> boolToggler]
 */
export default function useBoolToggler(initialState) {
    const [bool, setBool] = React.useState(initialState);
    return [bool, (force) => setBool(bool => typeof force === "undefined" ? !bool : force)];
}