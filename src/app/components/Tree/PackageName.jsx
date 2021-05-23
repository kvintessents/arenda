import React from 'react';
import cx from 'classnames';

export default function Module({ pckg }) {

    return (
        <>
            <span className={cx({ name: true, 'root-name': pckg.root })}>
                {pckg.name}
            </span>
            
            { pckg.linked ?
                <span className="link-label">LINKED</span>
            : null}
        </>
    );
}

