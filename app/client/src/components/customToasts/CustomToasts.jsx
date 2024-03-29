import React from 'react';
import { Header, Icon } from 'semantic-ui-react';

export const SyncToastMessageWarning = ({ title, message, basic }) => {

    if (basic) {
        return (
            <div className="w-full">
                <div className="text-orange-600 text-left" as="h5">
                    <Icon name="exclamation" color="orange" className="mr-4"/> {title && title + ":"} {message}
                </div>
            </div>
        )
    }

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

export const SyncToastMessageSuccess = ({ title, message, hideIcon, basic }) => {

    if (basic) {
        return (
            <div className="w-full">
                <div className="text-green-600 text-left" as="h5">
                    <Icon name="thumbs up" color="green" className="mr-4"/> {title && title + ":"} {message}
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <Header color="green" as="h5" textAlign="left">
                {hideIcon ? "" : (<Icon size="small" name="thumbs up" className="mt-1" />)}
                <Header.Content>
                    {title}
                    <Header.Subheader >{message}</Header.Subheader>
                </Header.Content>
            </Header>
        </div>
    )
}