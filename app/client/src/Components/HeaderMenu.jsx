import React from 'react';

import {Container, Header, Image, Menu} from "semantic-ui-react";

import {withRouter} from "react-router-dom";

import MadIcon from "../Assets/icon.png";

function CreateVault({history}) {

    return (
        <Menu secondary className="m-0">

            <Container fluid>

                <Menu.Item as='a' header className='p-0' onClick={() => history.push('/')}>

                    <Container fluid className="flex flex-row content-center items-center justify-center self-center justify-items-center">

                        <Image src={MadIcon} size="mini" className="mx-1"/>

                        <Container fluid>

                            <Header content="MadWallet" as="h4" className="mx-2"/>

                        </Container>

                    </Container>

                </Menu.Item>

            </Container>

        </Menu>
    )

}

export default withRouter(CreateVault);
