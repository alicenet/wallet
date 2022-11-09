import React, { useState } from "react";
import { Container, Icon, Menu, Message, Popup } from "semantic-ui-react";
import {
    MODAL_ACTION_TYPES,
    VAULT_ACTION_TYPES,
} from "redux/constants/_constants";
import { electronStoreCommonActions } from "store/electronStoreHelper";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { SyncToastMessageSuccess } from "components/customToasts/CustomToasts";

function Notification({ notification, onClose }) {
    const dispatch = useDispatch();
    const { wallets } = useSelector((state) => ({
        wallets: state.vault.wallets,
    }));

    if (!notification) {
        return <Message success>No notifications</Message>;
    }

    return (
        <Message
            warning
            className="cursor-pointer"
            onClick={() => {
                dispatch({
                    type: MODAL_ACTION_TYPES.OPEN_PW_REQUEST,
                    payload: {
                        reason: "Vault Synchronization", // We don't know the exaxt reason here, we just know a sync is needed
                        cb: async (password) => {
                            await electronStoreCommonActions.updateVaultWallets(
                                password,
                                wallets
                            );
                            toast.success(
                                <SyncToastMessageSuccess
                                    title="Success"
                                    message="Vault updated!"
                                />,
                                {
                                    position: "bottom-right",
                                    autoClose: 2400,
                                    delay: 500,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                }
                            );
                            dispatch({
                                type: VAULT_ACTION_TYPES.CLEAR_UNSYNCED_WALLETS,
                            });
                        },
                    },
                });
                toast.dismiss();
                onClose();
            }}
        >
            <div className="font-bold text-sm">Vault Update Request</div>
        </Message>
    );
}

function NotificationIcon({ notifications }) {
    const hasNotifications = notifications.length > 0;
    if (hasNotifications) {
        //Show alert for the first notification only
        return (
            <Icon
                name="bell"
                className="animate-pulse text-red-500 group-hover:text-black"
            />
        );
    }
    return <Icon name="bell slash" />;
}

export function Notifications({ notifications = [] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popup
            size="mini"
            content={
                <Container className="w-64">
                    <div
                        className="text-right cursor-pointer"
                        onClick={() => setIsOpen(false)}
                    >
                        <Icon name="close" className="mx-0" />
                    </div>
                    {/*We are only showing the first notification */}
                    <div>
                        <Notification
                            notification={notifications[0]}
                            onClose={() => setIsOpen(false)}
                        />
                    </div>
                </Container>
            }
            position="right center"
            offset="0, -4"
            open={isOpen}
            trigger={
                <Menu.Item
                    as="a"
                    header
                    onClick={() => setIsOpen(true)}
                    className="px-3 hover:bg-transparent group"
                >
                    <NotificationIcon notifications={notifications} />
                </Menu.Item>
            }
        />
    );
}
