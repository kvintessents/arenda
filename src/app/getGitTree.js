import fs from 'fs';
import { promisify } from 'util';
import { join } from 'path';

const readdir = promisify(fs.readdir).bind(fs);
const exists = promisify(fs.exists).bind(fs);
const lstat = promisify(fs.lstat).bind(fs);
const readFile = promisify(fs.readFile).bind(fs);

function map(array, fn) {
    return Promise.all(array.map(fn));
}

// const defaultFilter = (package) => package.name.includes('stream');
const defaultFilter = (name) => name.includes('test');
// const defaultFilter = () => true;

async function getPackageName(path) {
    const rawdata = await readFile(path);
    const packageConfig = JSON.parse(rawdata);

    return packageConfig.name;
}

function normalisePackageName(name) {
    return name.replaceAll('\\', '/')
}

async function getGitTree(path, { packageFilter = defaultFilter } = {}) {
    if (!(await exists(path))) {
        return [];
    }

    const dirs = await readdir(path);

    const packageJsonExists = await map(dirs, async (dir) => {
        return await exists(join(path, dir, 'package.json'));
    });

    const npmProjects = dirs.filter((dir, i) => packageJsonExists[i]);

    const packages = await map(npmProjects, async (projectDirName) => {
        const nodeModulesPath = join(path, projectDirName, 'node_modules');

        const [name, modules] = await Promise.all([
            getPackageName(join(path, projectDirName, 'package.json')),
            getNodeModulesTree(nodeModulesPath, {
                packageFilter
            }),
        ])

        return {
            name: name,
            path: join(path, projectDirName),
            linked: false,
            root: true,
            modules: modules,
        }
    });

    return packages;
}

async function getNodeModulesTree(nodeModulesPath, { packageFilter = () => true } = {}) {
    if (!(await exists(nodeModulesPath))) {
        return [];
    }

    const topSubPackages = await readdir(nodeModulesPath);

    let subPackages = await map(topSubPackages, async (subPackage) => {
        if (subPackage.startsWith('@')) {
            const scopedPackages = await readdir(join(nodeModulesPath, subPackage));

            return scopedPackages.map(scopedPackage => join(subPackage, scopedPackage));
        }

        return subPackage;
    });

    subPackages = subPackages.flat().filter((subPackage) => {
        return packageFilter(normalisePackageName(subPackage));
    });

    // subPackage is "packageName" or "@scoped/packageName" or "@scoped\packageName"
    subPackages = await map(subPackages, async subPackage => {
        const path = join(nodeModulesPath, subPackage);
        const fileInfo = await lstat(path);
        const subModulesPath = join(nodeModulesPath, subPackage, 'node_modules');

        const name = normalisePackageName(subPackage);
        const modules = await getNodeModulesTree(subModulesPath, { packageFilter });

        return {
            name: name,
            path: path,
            linked: fileInfo.isSymbolicLink(),
            root: false,
            modules: modules
        }
    });

    return subPackages;
}

export default getGitTree;