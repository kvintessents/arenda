__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    supportsFiber: true,
    inject: function() {},
    onCommitFiberRoot: function() {},
    onCommitFiberUnmount: function() {},
};

const { ipcRenderer, app } = require('electron');
const ReactDOM = require('react-dom');
const { createElement: h } = require('react');
const getGitTree = require('./getGitTree');
const Tree = require('./components/Tree');
const { join } = require('path');
const { homedir } = require('os');

const baseDir = join(homedir(), './git/');

window.addEventListener('DOMContentLoaded', async () => {
    const tree = await getGitTree(baseDir)

    ReactDOM.render(
        h(Tree, { tree }),
        document.getElementById('App')
    )
})

// ipcRenderer.invoke('perform-action', ...args)