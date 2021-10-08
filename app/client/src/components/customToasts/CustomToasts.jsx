import React from 'react';
import { Header, Icon } from 'semantic-ui-react';

export const SyncToastMessageWarning = ({title, message}) => {
    return (
        <div className="w-full">
            <Header color="orange" as="h5" textAlign="left">
                <Icon size="small" name="warning" className="mt-1" />
                <Header.Content>
                    {title}
                    <Header.Subheader >{message}</Header.Subheader>
                </Header.Content>
            </Header>
        </div>
    )
}

export const SyncToastMessageSuccess = ({title, message}) => {
    return (
        <div className="w-full">
            <Header color="green" as="h5" textAlign="left">
                <Icon size="small" name="thumbs up" className="mt-1" />
                <Header.Content>
                    {title}
                    <Header.Subheader >{message}</Header.Subheader>
                </Header.Content>
            </Header>
        </div>
    )
}