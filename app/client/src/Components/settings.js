import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from "../oldStore/store.js";
import { Container, Form, Button, Segment } from "semantic-ui-react"
import Switch from "react-switch";

function Settings(props) {
    // Store states and actions to update state
    const { store, actions } = useContext(StoreContext);
    // Object containing saved settings state
    const [settings, updateSettings] = useState(store.settings);

    // Updates for when component mounts or updates
    useEffect(() => {
        // Reset this component to orginal state
        if (props.states.refresh) {
            actions.resetSettings();
            updateSettings(store.settings)
            props.states.setRefresh(false);
        }
    }, [props, actions, store.settings])

    // Update settings state from user input
    const handleChange = (opt, event) => {
        if (opt === "theme") {
            updateSettings({
                ...settings,
                [opt]: props.states.style === "dark" ? "light" : "dark"
            })
            props.states.themeToggle(props.states.style === "dark" ? "light" : "dark")
            return;
        }
        updateSettings({
            ...settings,
            [opt]: event.target.value
        })
    }

    // Update Store settings
    const handleSubmit = (e) => {
        e.preventDefault();
        actions.updateSettings(settings);
    }

    const handleDefault = () => {
        actions.resetSettings(store.defaultSettings)
        actions.updateSettings(store.defaultSettings);
        updateSettings(
            store.defaultSettings
        )
    }

    // Reset input fields to previous saved state
    const reset = (e) => {
        e.preventDefault();
        let lastSaved = store.settings;
        updateSettings(
            lastSaved
        )
    }

    return (
        <Container>
            <Container textAlign="center"><h3>Settings</h3></Container>
            <Segment raised>
                <Form>
                    <Form.Input onChange={(e) => handleChange("madnetChainID", e)} value={settings.madnetChainID || ""} fluid label="MadNet ChainID" />
                    <Form.Input onChange={(e) => handleChange("madnetProvider", e)} value={settings.madnetProvider || ""} fluid label="MadNet Provider" />
                    <Form.Input onChange={(e) => handleChange("ethereumProvider", e)} value={settings.ethereumProvider || ""} fluid label="Ethereum Provider" />
                    <Form.Input onChange={(e) => handleChange("registryContract", e)} value={settings.registryContract || ""} fluid label="Registry Contract Address" />
                    <Form.Field>
                        <p>Dark Mode</p>
                        <Switch onColor="#4aec75" offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(e) => handleChange("theme", e)} checked={props.states.style === "dark"} />
                    </Form.Field>
                    <Button onClick={(e) => handleSubmit(e)} color="green">Save</Button>
                    <Button onClick={(e) => reset(e)} color="red">Cancel</Button>
                    <Button onClick={() => handleDefault()} color="grey">Default</Button>
                </Form>
            </Segment>
        </Container>
    )

}
export default Settings;