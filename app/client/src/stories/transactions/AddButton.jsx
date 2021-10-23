import React from 'react';

import { Button, Header, Icon } from 'semantic-ui-react';

export default function AddButton({ icon, text, onClick }) {

    return (
        <Button className="p-1 m-0 relative" onClick={onClick}>

            <Icon size="tiny" name='plus circle' className="text-sm	absolute p-1 top-0 right-0"/>

            <Header size="tiny" icon className="uppercase m-0 mx-3">

                Add<Icon name={icon}/>{text}

            </Header>

        </Button>
    )
}