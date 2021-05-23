import React, { useState } from 'react';
import getGitTree from '../getGitTree';

import Tree from '../components/Tree/Tree.jsx';
import Filter from '../components/Filter/Filter.jsx';

import './TreePage.scoped.scss';

export default function TreePage({ initTree, initFilterValue, baseDir }) {
    const [tree, setTree] = useState(initTree);

    async function onFilterInput(string) {
        const newTree = await getGitTree(baseDir, {
            packageFilter: value => value.toLowerCase().includes(string.toLowerCase()),
        });

        setTree(newTree);
    }

    return (
        <div className="page">
            <div className="TreePage__Filter">
                <Filter
                    initFilterValue={initFilterValue}
                    onFilterInput={onFilterInput}
                />
            </div>
            

            <Tree tree={tree} />
        </div>
    );
};
