import { Header, Grid, Button, Image } from "semantic-ui-react"
import MadIcon from 'Assets/icon.png';

export default function CreateVault() {

    return (

        <Grid textAlign="center" verticalAlign="middle" className="mt-14">

            <Grid.Column width={16}>

                <Header content="Welcome To" as="h3" className="mb-0" />

                <Image src={MadIcon} size="tiny" centered />

                <Header content="MadWallet" as="h3" className="mt-0"/>

            </Grid.Column>

            <Grid.Column width={16} className="mt-12">

                <p>It looks like it's your first time.</p>
                <p>Lets create your main vault.</p>

            </Grid.Column>

            <Grid.Row className="mt-8">

                <Grid.Column width={12} textAlign="center">
                    <Button content="Create A Vault" className="w-52" icon="world"  /> <br/>
                    <Button color="orange" basic content="I Have A Seed" className="w-52 mt-4"/>
                </Grid.Column>

            </Grid.Row>


        </Grid>

    )


}