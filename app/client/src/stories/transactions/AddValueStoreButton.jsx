import React from 'react';

import { Button, Checkbox, Header, Icon, Modal } from 'semantic-ui-react';

export default function AddValueStoreButton({ valueStore }) {

    const [okWithDelete, setOkWithDelete] = React.useState(false);
    const [doubleCheck, setDoubleCheck] = React.useState(false);
    const [isOpen, setOpen] = React.useState(false);

    const toggleOkWithDelete = () => setOkWithDelete(s => !s);
    const toggleDoubleCheck = () => setDoubleCheck(s => !s);
    const toggleOpen = () => setOpen(s => !s);

    return (
        <Modal
            open={isOpen}
            onOpen={toggleOpen}
            onClose={toggleOpen}
            size="fullscreen"
            trigger={
                <Button className="p-1 m-0 relative">

                    <Icon size="tiny" name='plus circle' className="text-sm	absolute p-1 top-0 right-0"/>

                    <Header size="tiny" icon className="uppercase m-0 mx-3">

                        Add<Icon name='currency'/>Value Store

                    </Header>

                </Button>
            }>

            <Modal.Header>

                <Header as="h4" color="red">Forgotten Vault Password</Header>

            </Modal.Header>

            <Modal.Content className="text-left">

                <p>
                    Please be aware this <span className="font-bold">will remove the existing vault and it will be lost forever</span>.
                </p>

            </Modal.Content>

            <Modal.Actions className="flex justify-between items-center">

                <div className="flex flex-col gap-4 text-left">

                    <Checkbox label="I acknowledge this will delete my current vault" checked={okWithDelete} onChange={toggleOkWithDelete}/>

                    <Checkbox label="I am sure I want to create a new vault -- I don't need it" checked={doubleCheck} onChange={toggleDoubleCheck}/>

                </div>

                <Button content="Create New Vault" color="red" disabled={!okWithDelete || !doubleCheck}/>

            </Modal.Actions>

        </Modal>
    )
}