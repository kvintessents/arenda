import React from 'react';
import PackageName from './PackageName';
import cx from 'classnames';

export default function Tree({ tree }) {
    tree = Array.isArray(tree) ? tree : [];

    return (
        <ul className="branch">
            {tree.map(pckg => (
                <li
                    key={pckg.path}
                    className={cx({
                        node: true,
                        'root-node': pckg.root
                    })}
                >
                    <PackageName pckg={pckg} />
                    
                    { pckg.modules.length ?
                        <Tree tree={pckg.modules} />
                    : null}
                </li>
            ))}
        </ul>
    )
}