const fs = require('fs');
const { promisify } = require('util');
const { join } = require('path');

const readdir = promisify(fs.readdir).bind(fs);
const exists = promisify(fs.exists).bind(fs);
const lstat = promisify(fs.lstat).bind(fs);

function map(array, fn) {
    return Promise.all(array.map(fn));
}

// const defaultFilter = (package) => package.name.includes('stream');
const defaultFilter = (name) => name.includes('test');
// const defaultFilter = () => true;

async function getGitTree(path, { packageFilter = defaultFilter } = {}) {
    const dirs = await readdir(path);

    const packageJsonExists = await map(dirs, async (dir) => {
        return await exists(join(path, dir, 'package.json'));
    });

    const npmProjects = dirs.filter((dir, i) => packageJsonExists[i]);

    const packages = await map(npmProjects, async (projectDirName) => {
        const nodeModulesPath = join(path, projectDirName, 'node_modules');

        return {
            name: projectDirName,
            path: nodeModulesPath,
            linked: false,
            root: true,
            modules: await getNodeModulesTree(nodeModulesPath, {
                packageFilter
            }),
        }
    });

    console.log(packages);

    return packages;
}

async function getNodeModulesTree(nodeModulesPath, { packageFilter = () => true } = {}) {
    const topSubPackages = await readdir(nodeModulesPath);

    subPackages = await map(topSubPackages, async (package) => {
        if (package.startsWith('@')) {
            const scopedPackages = await readdir(join(nodeModulesPath, package));

            return scopedPackages.map(scopedPackage => join(package, scopedPackage));
        }

        return package;
    });

    subPackages = subPackages.flat().filter(packageFilter);

    subPackages = await map(subPackages, async (package) => {
        const path = join(nodeModulesPath, package);
        const fileInfo = await lstat(path);
        const subModulesPath = join(nodeModulesPath, package, 'node_modules');
        const subModulesExist = await exists(subModulesPath);

        const subModules = subModulesExist ? await getNodeModulesTree(
            subModulesPath,
            {
                name: package,
                packageFilter
            }
        ) : [];

        return {
            name: package,
            path: path,
            linked: fileInfo.isSymbolicLink(),
            root: false,
            modules: subModules
        }
    });

    return subPackages;
}



module.exports = getGitTree;