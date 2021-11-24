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
        <div className="flex flex-col justify-between item gap-2">

            <div className="flex flex-col items-start">

                <div className="flex text-xl font-bold">

                    <Popup
                        size="mini"
                        className="w-60"
                        offset="10,0"
                        trigger={
                            <div className="flex items-center text-xl gap-2">
                                <div className="m-0 font-bold">Change Address</div>
                                <Icon size="small" name="question circle" className="m-0 cursor-pointer"/>
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

            <Button
                basic
                color="teal"
                content="Use Custom Address"
                className="m-0 w-52"
                onClick={() => setShowChangeReturnAddressModal(true)}
            />

            <ChangeReturnAddressModal
                open={showChangeReturnAddressModal}
                onClose={() => setShowChangeReturnAddressModal(false)}
            />

        </div>
    )
}