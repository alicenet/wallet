import React, { useState } from 'react';
import { Button, Icon, Popup } from 'semantic-ui-react';
import { useSelector } from 'react-redux';

import utils from 'util/_util';
import ChangeReturnAddressModal from './ChangeReturnAddressModal';

export default function ChangeReturnAddress() {

    const { changeReturnAddress } = useSelector(state => ({
        changeReturnAddress: state.transaction.changeReturnAddress,
    }));

    const [showChangeReturnAddressModal, setShowChangeReturnAddressModal] = useState(false);

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
                            <div className="flex items-center text-xl gap-2 cursor-pointer" onClick={() => setShowChangeReturnAddressModal(true)}>
                                <div className="m-0 font-bold text-sm">Change Address</div>
                                <Icon size="small" name="edit circle" className="m-0"/>
                            </div>
                        }
                        content={
                            <div className="text-sm">Your change address is where remaining UTXOs will go.<br/>
                                This defaults to the first sending wallet, though you may choose which wallet to use.
                            </div>
                        }
                    />

                </div>

                <div>
                    {`0x${utils.string.splitStringWithEllipsis(changeReturnAddress, 10)}`}
                </div>

            </div>

            <ChangeReturnAddressModal
                open={showChangeReturnAddressModal}
                onClose={() => setShowChangeReturnAddressModal(false)}
            />

        </>
    )
}