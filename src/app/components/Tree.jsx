import React, { Component, createElement as h } from 'react';

function clss(object) {
    const keys = Object.entries(object)
            .filter(([key, value]) => !!value)
            .map(([key, value]) => key)
            .join(' ')

    return keys;
}

export default class Tree extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const tree = Array.isArray(this.props.tree) ? this.props.tree : ['no tree'];

        return (
            <ul className="branch">
                {tree.map(dir => (
                    <li
                        key={dir.path}
                        className={clss({
                            node: true,
                            'root-node': dir.root
                        })}
                    >
                        <span className={clss({ name: true, 'root-name': dir.root })}>
                            {dir.name}
                        </span>
                        
                        { dir.linked ?
                            <span className="link-label">LINKED</span>
                        : null}
                        
                        { dir.modules.length ?
                            <Tree tree={dir.modules} />
                        : null}
                    </li>
                ))}
            </ul>
        )
    }
}