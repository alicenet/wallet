import React, { useState } from 'react';
import { Container, Label, Icon, Menu, Popup, Message } from 'semantic-ui-react';
import { MODAL_ACTION_TYPES } from 'redux/constants/_constants';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';
import { VAULT_ACTIONS } from 'redux/actions/_actions';

function Notification({ notification, onClose }){
    const dispatch = useDispatch();
    const { wallets } = useSelector(state => (
        { wallets: state.vault.wallets }
    ));
    return <Message warning className="cursor-pointer" onClick={
        () => {
            dispatch({
                type: MODAL_ACTION_TYPES.OPEN_PW_REQUEST, payload: {
                    reason: "Vault Synchronization | " + notification,
                    cb: async (password) => {
                        await electronStoreCommonActions.updateVaultWallets(password, wallets)
                        toast.success(<SyncToastMessageSuccess title="Success" message={notification} />, {
                            position: "bottom-right",
                            autoClose: 2400,
                            delay: 500,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                        //clear wallets
                        //dispatch(VAULT_ACTIONS.syncUnsavedWallets())
                    }
                }
            })
            toast.dismiss()
            onClose()
        }
    }>
            <div className="font-bold text-sm">Vault Update Request</div>
        </Message>
}

export function Notifications({ notifications = [] }){
    const [isOpen, setIsOpen] = useState(false)
    return <Popup size="mini"
                content={<Container className="w-64">
                            <div className="text-right cursor-pointer" onClick={() => setIsOpen(false)}><Icon name="close" className="mx-0"/></div>
                            {/*We are only showing one of the notifications */}
                            <div>{notifications.length <= 0 ? "No pending alerts" : <Notification notification={notifications[0]} onClose={() => setIsOpen(false)}/>}</div>
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