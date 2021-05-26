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

async function getGitTree(rootPath, { packageFilter = defaultFilter } = {}) {
    if (!(await exists(rootPath))) {
        return [];
    }

    const dirs = await readdir(rootPath);
    const packageJsonExists = await map(dirs, async (dir) => {
        return await exists(join(rootPath, dir, 'package.json'));
    });

    const namedProjects = await map(
        // Only allow projects with existing package.json files
        dirs.filter((dir, i) => packageJsonExists[i]),

        // output { name: package.json name, path: path to git dir }
        async (projectDirName) => {
            return {
                name: await getPackageName(join(rootPath, projectDirName, 'package.json')),
                path: join(rootPath, projectDirName),
            }
        }
    );

    const projectTree = await map(namedProjects, async ({ name, path }) => {
        const project = {
            name: name,
            path: path,
            linkable: false,
            linked: false,
            root: true,
            modules: [],
        }

        project.modules = await getNodeModulesTree(join(path, 'node_modules'), {
            packageFilter,
            projectNames: namedProjects.map(({ name }) => name),
            showLocalProjectsOnly: true,
            parent: project,
        });
        
        return project;
    });

    return projectTree;
}

async function getNodeModulesTree(nodeModulesPath, { packageFilter, showLocalProjectsOnly, projectNames, parent } = {}) {
    if (!(await exists(nodeModulesPath))) {
        return [];
    }

    const topSubPackages = await readdir(nodeModulesPath);

    // Normalisation
    let subPackages = await map(topSubPackages, async (subPackage) => {
        if (subPackage.startsWith('@')) {
            const scopedPackages = await readdir(join(nodeModulesPath, subPackage));

            return scopedPackages.map(scopedPackage => join(subPackage, scopedPackage));
        }

        return subPackage;
    });

    // Filtering
    subPackages = subPackages.flat().filter((subPackage) => {
        const name = normalisePackageName(subPackage);

        if (showLocalProjectsOnly) {
            return projectNames.includes(name) && packageFilter(name);
        }

        return packageFilter(name);
    });

    // subPackage is "packageName" or "@scoped/packageName" or "@scoped\packageName"
    subPackages = await map(subPackages, async subPackage => {
        const path = join(nodeModulesPath, subPackage);
        const fileInfo = await lstat(path);
        const subModulesPath = join(nodeModulesPath, subPackage, 'node_modules');

        const name = normalisePackageName(subPackage);

        const packageObject = {
            name: name,
            path: path,
            linkable: projectNames.includes(name),
            linked: fileInfo.isSymbolicLink(),
            root: false,
            modules: [],
            parent: parent,
        };

        packageObject.modules = await getNodeModulesTree(subModulesPath, {
            packageFilter, showLocalProjectsOnly, projectNames, parent: packageObject
        });

        return packageObject;
    });

    return subPackages;
}

export default getGitTree;