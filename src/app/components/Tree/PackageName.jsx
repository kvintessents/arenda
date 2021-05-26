import React from 'react';
import cx from 'classnames';
import LinkIcon from './LinkIcon';
import './PackageName.scoped.scss';

export default function PackageName({
    pckg, project, onLinkRequest, onUnlinkRequest, currentlyLinking = null, onNpmCiRequest
}) {
    
    function onLinkClick() {
        onLinkRequest(pckg, project);
    }

    function onUnlinkClick() {
        onUnlinkRequest(pckg, project);
    }

    function onNpmCiClick() {
        onNpmCiRequest(pckg);
    }

    return (
        <div className="name-container">
            { pckg.root && <button onClick={onNpmCiClick} className="npm-ci-button">↻</button> }

            { pckg === currentlyLinking && <span className="linking-spinner">◡</span> }

            { pckg.linkable && (pckg.linked
                ? <button onClick={onUnlinkClick} className="unlink-button"><LinkIcon /></button>
                : <button onClick={onLinkClick} className="link-button"><LinkIcon /></button>
            )}

            <span className={cx({ name: true, 'root-name': pckg.root })}>
                {pckg.name}
            </span>
        </div>
    );
}
