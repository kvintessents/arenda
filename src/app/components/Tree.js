const { Component, createElement: h } = require('react');

function classObject(object) {
    const keys = Object.entries(object)
            .filter(([key, value]) => !!value)
            .map(([key, value]) => key)
            .join(' ')

    return keys;
}

module.exports = class Tree extends Component {
    constructor(props) {
        super(props);
        this.state = {date: new Date()};
    }

    render() {
        const tree = Array.isArray(this.props.tree) ? this.props.tree : ['no tree'];

        return h('ul', { className: 'branch' }, tree.map(dir => {
            return h('li', { key: dir.path, className: classObject({ node: true, 'root-node': dir.root }) }, [
                h('span', {
                    className: classObject({ name: true, 'root-name': dir.root }),
                }, dir.name),

                dir.linked ? h('span', {className: 'link-label'}, 'LINKED') : null,

                dir.modules.length ? h(Tree, { tree: dir.modules }) : null
            ]);
        }));
    }
}