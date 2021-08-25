import React from 'react';
import { Container } from 'semantic-ui-react';

import CreateNewVaultSemantic from './CreateNewVaultSMT';
import CreateNewVaultMUI from './CreateNewVaultMUI';

export default function MainHub(props) {

    const CreateNewVault = true ? CreateNewVaultSemantic : CreateNewVaultMUI;

    return (
        <CreateNewVault />
    )

}