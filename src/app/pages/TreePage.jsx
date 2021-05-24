import React, { useState } from 'react';
import getGitTree from '../getGitTree';

import Tree from '../components/Tree/Tree.jsx';
import Filter from '../components/Filter/Filter.jsx';

import './TreePage.scoped.scss';

import { link, unlink } from '../commands';

export default function TreePage({ initTree, initFilterValue, baseDir }) {
    const [tree, setTree] = useState(initTree);
    const [filter, setFilter] = useState(initFilterValue);
    const [currentlyLinking, setCurrentlyLinking] = useState(null);

    async function refreshTree() {
        const newTree = await getGitTree(baseDir, {
            packageFilter: value => value.toLowerCase().includes(filter.toLowerCase()),
        });

        setTree(newTree);
    }

    async function onFilterInput(string) {
        setFilter(string);
        refreshTree();
    }

    async function onLinkRequest(pckg, project) {
        setCurrentlyLinking(pckg);
        const packageProject = tree.find(project => project.name === pckg.name);
        const output = await link(project, packageProject);
        console.log(output);
        setCurrentlyLinking(null);
        refreshTree();
    }

    async function onUnlinkRequest(pckg, project) {
        console.log('Got unlink request');
        setCurrentlyLinking(pckg);
        const packageProject = tree.find(project => project.name === pckg.name);
        const output = await unlink(project, packageProject);
        console.log(output);
        setCurrentlyLinking(null);
        refreshTree();
    }

    return (
        <div className="page">
            <div className="TreePage__Filter">
                <Filter
                    initFilterValue={initFilterValue}
                    onFilterInput={onFilterInput}
                />
            </div>
            

            <Tree
                tree={tree}
                onLinkRequest={onLinkRequest}
                onUnlinkRequest={onUnlinkRequest}
                currentlyLinking={currentlyLinking}
            />
        </div>
    );
};
