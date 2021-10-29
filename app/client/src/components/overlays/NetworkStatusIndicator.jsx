import { red } from 'bn.js';
import React from 'react';
import { useSelector } from 'react-redux';
import { classNames } from 'util/generic';
import lstyle from './NetworkStatusIndicator.module.scss'

export default function NetworkStatusIndicator() {

    const {
        web3Connected, web3Busy,
        madConnected, madBusy
    } = useSelector(s => ({
        web3Connected: s.adapter.web3Adapter.connected, 
        web3Busy: s.adapter.web3Adapter.busy,
        madConnected: s.adapter.madNetAdapter.connected,
        madBusy: s.adapter.madNetAdapter.busy
    }));

    const web3Color = web3Busy ? "yellow" : web3Connected ? "green" : "red";
    const madColor = madBusy ? "yellow" : madConnected ? "green" : "red";

    return (

        <div className="flex flex-col absolute bottom-0.5 left-1 text-xs">

            <div className="flex items-center justify-between text-gray-600">
                <div className="font-bold font-mono">
                    ETH
                </div>
                <div className="relative" style={{top: "-1px", marginLeft: "4px"}}>
                    <StatusLight color={web3Color} />
                </div>
            </div>

            <div className="flex items-center">
                <div className="font-bold text-gray-600 font-mono">
                    MAD
                </div>
                <div className='relative' style={{top: "-1px", marginLeft: "4px"}}>
                    <StatusLight color={madColor} />
                </div>
            </div>

        </div>

    )

}

function StatusLight({ className, color, ...props }) {

    let baseClass = "rounded-full border-solid border " + (className ? (" " + className) : "");
    let colorClass = color === "red" ? "bg-red-500" : color === "yellow" ? "bg-yellow-500 animate-pulse" : color === "green" ? "bg-green-400" : "bg-gray-400";
    let colorBorderClass = color === "red" ? "border-red-400" : color === "yellow" ? "border-yellow-400" : color === "green" ? "border-green-300" : "border-gray-500";

    let fullClass = [baseClass, colorClass, colorBorderClass].join(" ");

    return (
        <div className={fullClass} style={{width: "7px", height: "7px"}} />
    )

}