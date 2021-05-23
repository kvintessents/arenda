import React, { useState } from 'react';
import './Filter.scoped.scss';

export default function Filter({ initFilterValue = "", onFilterInput = () => {} }) {
    const [value, setValue] = useState(initFilterValue);

    function onInput(e) {
        const newValue = e.target.value.trim();
        setValue(newValue);
        onFilterInput(newValue);
    }

    return (
        <div className="Filter">
            <input type="text" onInput={onInput} value={value} className="Filter-input" />
        </div>
    );
};
