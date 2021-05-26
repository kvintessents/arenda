import React, { useState } from 'react';
import getGitTree from '../getGitTree';

import Tree from '../components/Tree/Tree.jsx';
import Filter from '../components/Filter/Filter.jsx';

import './TreePage.scoped.scss';

import { link, unlink, ci } from '../commands';

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

    async function onLinkRequest(pckg) {
        setCurrentlyLinking(pckg);
        const packageProject = tree.find(project => project.name === pckg.name);
        const parentProject = tree.find(project => project.name === pckg.parent.name);
        const output = await link(parentProject, packageProject);
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

    async function onNpmCiRequest(project) {
        console.log('Got NPM CI request');
        setCurrentlyLinking(project);
        let output;
        try {
            output = await ci(project);
        } catch (e) {
            console.error(e);
        }
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
                onNpmCiRequest={onNpmCiRequest}
                currentlyLinking={currentlyLinking}
            />
        </div>
    );
};
