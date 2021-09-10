import React from 'react';

import PropTypes from 'prop-types';

import {Container} from 'semantic-ui-react';

import HeaderMenu from './HeaderMenu';

const Page = ({children}) => {

    return (
        <Container className="h-full flex flex-col justify-center" fluid>

            <HeaderMenu showTabs={false}/>

            <Container className="h-full flex flex-col items-center justify-center">

                {children}

            </Container>

        </Container>
    );
};

Page.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Page;
