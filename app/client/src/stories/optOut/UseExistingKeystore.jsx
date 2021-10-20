import React from 'react';

import { Button, Container, Form, Grid, Header, Input } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useFormState } from 'hooks/_hooks';

import Page from 'layout/Page';

function UseExistingKeystore() {

    const history = useHistory();

    const [formState, formSetter, onSubmit] = useFormState([{ name: 'password', type: 'password', isRequired: true }]);
    const [fileName, setFileName] = React.useState('');

    const handleFormSubmit = () => {
        history.push('/');
    }

    const handleFileSelected = event => {
        setFileName(event.target.value);
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Use Existing Keystore" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-sm">

                    <p>Please choose an existing keystore file to load.</p>

                </Grid.Column>

                <Grid.Column width={10} className="p-0 self-center">

                    <Form onSubmit={() => onSubmit(handleFormSubmit)}>

                        <Form.Group className="flex flex-auto flex-col m-0 text-left text-sm gap-5">

                            <Form.Field className="p-0">

                                <Container className="flex justify-center items-center">

                                    <Form.Input
                                        id='file'
                                        placeholder='Keystore file'
                                        type='text'
                                        required
                                        className="w-full"
                                        value={fileName}
                                    >
                                        <input className="rounded-r-none"/>

                                        <Button as="label" color="blue" htmlFor="fileUpload" type="button" className="min-w-max m-0 rounded-l-none">
                                            Select From File
                                        </Button>

                                        <Input type="file" id="fileUpload" className="hidden" onChange={handleFileSelected}/>

                                    </Form.Input>

                                </Container>

                            </Form.Field>

                            <Form.Input
                                id='password'
                                placeholder='Keystore Password'
                                type='password'
                                className="p-0"
                                required
                                disabled={fileName.length === 0}
                                onChange={e => formSetter.setPassword(e.target.value)}
                                error={!!formState.password.error && { content: formState.password.error }}
                            />

                        </Form.Group>

                    </Form>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <Button color="orange" basic content="Go Back" className="m-0" onClick={() => history.push('/optOut/disclaimer')}/>

                        <Button color="teal" disabled={fileName.length === 0} basic content='Unlock Keystore' className="m-0" onClick={() => onSubmit(handleFormSubmit)}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default UseExistingKeystore;