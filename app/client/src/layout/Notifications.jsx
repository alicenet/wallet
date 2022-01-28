import React, { useState } from 'react';
import { Container, Label, Icon, Menu, Popup, Message } from 'semantic-ui-react';

function Notification({ notification }){
    return <Message className="cursor-pointer">
            <div className="font-bold text-sm">{notification.title}</div>
            <p className="text-xs">{notification.message}</p>
        </Message>
}

export function Notifications({ notifications = [] }){
    const [isOpen, setIsOpen] = useState(false)
    return <Popup size="mini"
                content={<Container className="w-64">
                            <div className="text-right cursor-pointer" onClick={() => setIsOpen(false)}><Icon name="close" className="mx-0"/></div>
                            <div>{notifications.length <= 0 ? "No pending alerts" : notifications.map(n => <Notification notification={n} key={n.id}/>)}</div>
                        </Container>}
                position="right center" 
                offset="0, -4"
                open={isOpen}
                trigger={
                    <Menu.Item as='a' header  onClick={() => setIsOpen(true)} className="px-3 hover:bg-transparent group">
                        {notifications.length > 0 ? <><Icon name="bell" className="transform duration-300 group-hover:rotate-90" /><Label className={`floating ${notifications.length > 0 && 'red'} top-0 left-8 text-micro`}>{notifications.length}</Label></> : <Icon name="bell slash" />}
                    </Menu.Item>
                }
            />
}