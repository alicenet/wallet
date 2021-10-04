import React from 'react';

import PropTypes from 'prop-types';

import { Container } from 'semantic-ui-react';

import HeaderMenu from './HeaderMenu';

const Page = ({ children }) => {

    return (
        <Container className="h-full flex flex-col" fluid>

            <HeaderMenu/>

            <Container className="w-full h-full flex">

                {children}

            </Container>

        </Container>
    );
};

Page.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Page;
