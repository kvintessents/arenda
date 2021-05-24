import { join } from 'path';
import { homedir } from 'os';
import ReactDOM from 'react-dom';
import React from 'react';
import TreePage from './pages/TreePage.jsx';
import getGitTree from './getGitTree';

const baseDir = join(homedir(), './git/');
const initFilterValue = '';

window.addEventListener('DOMContentLoaded', async () => {
    const tree = await getGitTree(baseDir, {
        packageFilter: value => value.includes(initFilterValue.trim()),
    });

    ReactDOM.render(
        <TreePage
            initTree={tree}
            initFilterValue={initFilterValue}
            baseDir={baseDir}
        />,
        document.getElementById('App')
    )
})

// ipcRenderer.invoke('perform-action', ...args)