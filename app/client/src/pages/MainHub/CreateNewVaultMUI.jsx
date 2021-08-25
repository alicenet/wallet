import React from 'react';
import { Avatar, Grid, Typography, Box, Button, Container } from '@material-ui/core';
import MadIcon from 'Assets/icon.png';

export default function CreateNewVault() {

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
                        <Button color="warning">Button 1</Button>
                    </Grid>

                    <Grid item xs="6" align="center">
                        <Button color="secondary">Button 2</Button>
                    </Grid>



                </Grid>

            </Box>


        </Grid>

    )

}