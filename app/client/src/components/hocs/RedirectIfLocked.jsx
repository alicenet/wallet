import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

const RedirectIfLocked = ({ children }) => {

    const { vaultExistsAndIsLocked } = useSelector(s => ({ vaultExistsAndIsLocked: s.vault.is_locked }))
    const history = useHistory();

    useEffect(() => {
        if (vaultExistsAndIsLocked) {
            // Send to root for appropriate redirect
            history.push('/');
        }
    }, [vaultExistsAndIsLocked, history])

    return (
        <>
            {children}
        </>
    );
};

RedirectIfLocked.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RedirectIfLocked;
