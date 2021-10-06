import React from 'react';

import { Container } from 'semantic-ui-react'

export default function OverviewTabPane({wallet}) {

    return (
        <Container>
            {JSON.stringify(wallet)}
        </Container>
    )

}

