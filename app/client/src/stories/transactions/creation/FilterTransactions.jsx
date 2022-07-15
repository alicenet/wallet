import React from 'react';
import { Dropdown } from 'semantic-ui-react';

const options = [
    { key: 0, text: 'All', value: 0 },
    { key: 1, text: 'Data Stores', value: 1 },
    { key: 2, text: 'Value Stores', value: 2 }
];

export default function FilterTransactions({ value, handleChange }) {
    return <Dropdown
        placeholder='Filter Transactions'
        icon='filter'
        floating
        labeled
        selection
        button
        className='icon'
        onChange={handleChange}
        value={value}
        options={options}
    />
}