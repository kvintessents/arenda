import React from 'react';
import PackageName from './PackageName';
import cx from 'classnames';

export default function Tree({
    tree = null,
    project = null,
    onLinkRequest = () => {},
    onUnlinkRequest = () => {},
    onNpmCiRequest = () => {},
    currentlyLinking = null,
}) {
    if (!Array.isArray(tree)) {
        return null;
    }

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
                    <PackageName
                        pckg={pckg}
                        project={project}
                        onLinkRequest={onLinkRequest}
                        onUnlinkRequest={onUnlinkRequest}
                        onNpmCiRequest={onNpmCiRequest}
                        currentlyLinking={currentlyLinking}
                    />

                    { pckg.modules.length ?
                        <Tree
                            tree={pckg.modules}
                            project={project || pckg}
                            onLinkRequest={onLinkRequest}
                            onUnlinkRequest={onUnlinkRequest}
                            onNpmCiRequest={onNpmCiRequest}
                            currentlyLinking={currentlyLinking}
                        />
                    : null}
                </li>
            ))}
        </ul>
    )
}