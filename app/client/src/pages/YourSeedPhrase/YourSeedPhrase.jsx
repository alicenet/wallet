import React from 'react';

import PropTypes from 'prop-types';

import {Button, Checkbox, Container, Grid, GridRow, Header} from "semantic-ui-react";

import chunk from "lodash/chunk";

import {useHistory} from "react-router-dom";

import HeaderMenu from "../../Components/HeaderMenu";

function YourSeedPhrase({seedPhrase}) {

    const [isChecked, setIsChecked] = React.useState(false);

    const history = useHistory();

    return (
        <div>

            <HeaderMenu/>

            <Container>

                <Grid textAlign="center" verticalAlign="middle">

                    <Grid.Column width={16}>

                        <Header content="Your Seed Phrase" as="h3" className="my-0"/>

                    </Grid.Column>

                    <Grid.Column width={16} className="m-2">

                        <p>Below is your seed phrase, please store it in a secure place.</p>

                        <p>You will be required to re-enter it on the next page.</p>

                    </Grid.Column>

                    <Grid.Column width={16} className="m-2">

                        <Grid celled columns={6}>

                            {chunk(seedPhrase, Math.floor(seedPhrase.length / 2)).map(someSeeds =>

                                <GridRow>

                                    {someSeeds.map(word => <Grid.Column key={word}>{word}</Grid.Column>)}

                                </GridRow>
                            )}

                        </Grid>

                    </Grid.Column>

                    <Grid.Column width={16} className="m-2">

                        <p className="text-red-600 uppercase text-sm">

                            <strong>Do not share your seed phrase</strong>

                        </p>

                    </Grid.Column>

                    <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                        <Container fluid className="flex flex-auto flex-col items-center gap-5 w-96">

                            <Button color="purple" basic disabled={!isChecked}
                                    content="I'm Ready To Verify The Seed Phrase" fluid
                                    onClick={() => history.push('/')}/>

                            <Checkbox onChange={() => setIsChecked(prevState => !prevState)} checked={isChecked}
                                      label={<label>I Have Stores This Seed Securely</label>}/>

                        </Container>

                    </Grid.Column>

                </Grid>

            </Container>

        </div>
    )

}

export default YourSeedPhrase;

YourSeedPhrase.defaultProps = {
    seedPhrase: ['science', 'crack', 'knee', 'whisper', 'gown', 'gas', 'hint', 'car', 'stumble', 'derive', 'tank', 'apart'],
};

YourSeedPhrase.propTypes = {
    seedPhrase: PropTypes.arrayOf(PropTypes.string),
};
