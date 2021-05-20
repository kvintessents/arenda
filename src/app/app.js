import { ipcRenderer, app } from 'electron';
import ReactDOM from 'react-dom';
import { createElement as h } from 'react';
import getGitTree from './getGitTree';
import Tree from './components/Tree.jsx';
import { join } from 'path';
import { homedir } from 'os';

const baseDir = join(homedir(), './git/');

window.addEventListener('DOMContentLoaded', async () => {
    const tree = await getGitTree(baseDir);

    ReactDOM.render(
        h(Tree, { tree }),
        document.getElementById('App')
    )
})

// ipcRenderer.invoke('perform-action', ...args)