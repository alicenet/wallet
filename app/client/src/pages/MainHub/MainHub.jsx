import React from 'react';
import { Avatar, Grid, Container, Typography, Box, Button, makeStyles } from '@material-ui/core';
import {Button as SButton } from 'semantic-ui-react';
import MadIcon from 'Assets/icon.png';

function MainHub(props) {

    console.log(window.theme);

    return (
        <Container>
            <CreateNewVault />
        </Container>
    )

}

export default MainHub

const useStyles = makeStyles((theme) => ({
    defaultButton: {
    border: "1px solid black",
    borderRadius: "8px",
    fontSize: '22px',
    letterSpacing: '1.5px',
    lineHeight: '28px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    }
}));

function CreateNewVault() {
    const classes = useStyles();

    return (

        <Grid container justifyContent="center" alignContent="center" direction="column" spacing="4" >

            <Grid item xs="12" align="center" justifyContent="center" style={{ textAlign: "center" }}>

                <Typography variant="h3" component="p">
                    Welcome To
                </Typography>

                <Box display="flex" justifyContent="center">
                    <Avatar alt="MadLogo" src={MadIcon} />
                </Box>

                <Typography variant="h1" component="h1">
                    Mad Wallet
                </Typography>

            </Grid>

            <Grid item xs="12" align="center">

                <Box mt={4} >
                    <Typography variant="body1" component="p">
                        It looks like this is your first time.<br />
                        Let create your main vault.
                    </Typography>
                </Box>

            </Grid>

            <Box mt={4}>

                <Grid container justifyContent="center" alignContent="center" direction="row">

                    <Grid item xs="6" align="center">
                        <Button className={classes.defaultButton} >Test1</Button>
                        <SButton content="text" color="red" />
                        <SButton content="text1" outline color="green" />
                        <SButton content="text2" inverted color="purple" />
                        <SButton content="text3" disabled color="yellow" />
                    </Grid>

                    <Grid item xs="6" align="center">
                        <Button variant="outlined" color="orange" >Test2</Button>

                    
                    </Grid>



                </Grid>

            </Box>


        </Grid>

    )

}