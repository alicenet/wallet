import React, { useEffect, useMemo, useState } from "react";
import { Icon, Popup } from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";
import head from "lodash/head";

import utils from "util/_util";
import ChangeReturnAddressModal from "./ChangeReturnAddressModal";
import { TRANSACTION_ACTIONS } from "redux/actions/_actions";

export default function ChangeReturnAddress() {
    const dispatch = useDispatch();

    const { internal, external, changeReturn } = useSelector((state) => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
        changeReturn: state.transaction.changeReturn,
    }));

    const wallets = useMemo(
        () => internal.concat(external) || [],
        [internal, external]
    );

    const [showChangeReturnAddressModal, setShowChangeReturnAddressModal] =
        useState(false);

    useEffect(() => {
        if (!changeReturn) {
            const firstWallet = head(wallets);
            if (firstWallet) {
                dispatch(
                    TRANSACTION_ACTIONS.saveChangeReturnAddress({
                        address: utils.string.removeHexPrefix(
                            firstWallet.address
                        ),
                        curve: firstWallet.curve,
                    })
                );
            }
        }
    }, [wallets, changeReturn, dispatch]);

    return (
        <>
            <div className="flex flex-col items-start">
                <div className="flex text-xl font-bold">
                    <Popup
                        size="mini"
                        className="w-60"
                        position="right center"
                        offset={"0,2"}
                        trigger={
                            <div
                                className="flex items-center text-xl gap-2 cursor-pointer"
                                tabindex="0"
                                onKeyDown={(e) =>
                                    (e.key === " " ||
                                        e.key === "Enter" ||
                                        e.key === "Spacebar") &&
                                    setShowChangeReturnAddressModal(true)
                                }
                                onClick={() =>
                                    setShowChangeReturnAddressModal(true)
                                }
                            >
                                <div className="m-0 font-bold text-sm">
                                    Change Address
                                </div>
                                <Icon
                                    size="small"
                                    name="edit"
                                    className="m-0"
                                />
                            </div>
                        }
                        content={
                            <div className="text-sm">
                                Your change address is where remaining UTXOs
                                will go.
                                <br />
                                This defaults to the first sending wallet,
                                though you may choose which wallet to use.
                            </div>
                        }
                    />
                </div>

                <div>
                    {utils.string.addCurvePrefix(
                        utils.string.splitStringWithEllipsis(
                            changeReturn?.address,
                            10
                        ),
                        changeReturn?.curve
                    )}
                </div>
            </div>

            <ChangeReturnAddressModal
                open={showChangeReturnAddressModal}
                onClose={() => setShowChangeReturnAddressModal(false)}
            />
        </>
    );
}
