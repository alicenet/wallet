import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

const RedirectIfLocked = ({ children }) => {
    const { vaultExistsAndIsLocked } = useSelector((s) => ({
        vaultExistsAndIsLocked: s.vault.is_locked,
    }));
    const history = useHistory();

    useEffect(() => {
        if (vaultExistsAndIsLocked) {
            // Send to root for appropriate redirect
            history.push("/");
        }
    }, [vaultExistsAndIsLocked, history]);

    return <>{children}</>;
};

export default RedirectIfLocked;
