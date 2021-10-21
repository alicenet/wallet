import React from 'react';

import { Header, Segment } from 'semantic-ui-react';

export default function RecentTxs({ wallet }) {
    return (
        <Segment placeholder className="m-4">
            <Header icon>
                No recent transactions were found.
            </Header>
        </Segment>
    );
}
