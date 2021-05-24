import React from 'react';
import cx from 'classnames';

import './PackageName.scoped.scss';

export default function PackageName({ pckg, project, onLinkRequest, onUnlinkRequest, currentlyLinking = null }) {
    
    function onLinkClick() {
        onLinkRequest(pckg, project);
    }

    function onUnlinkClick() {
        onUnlinkRequest(pckg, project);
    }

    return (
        <div className="name-container">
            { pckg === currentlyLinking && <span className="linking-spinner">◡</span> }

            { pckg.linkable && (pckg.linked
                ? <button onClick={onUnlinkClick} className="unlink-button">LINKED</button>
                : <button onClick={onLinkClick} className="link-button">LINK</button>
            )}

            <span className={cx({ name: true, 'root-name': pckg.root })}>
                {pckg.name}
            </span>
        </div>
    );
}
