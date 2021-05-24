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

async function getGitTree(rootPath, { packageFilter = defaultFilter, showLocalProjectsOnly = true } = {}) {
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

    // [ '@amiran/my-project', '@amiran/my-other-project', ... ]
    const projectNames = namedProjects.map(({name}) => name);

    const projectTree = await map(namedProjects, async ({ name, path }) => {
        return {
            name: name,
            path: path,
            linkable: false,
            linked: false,
            root: true,
            modules: await getNodeModulesTree(
                join(path, 'node_modules'),
                {
                    packageFilter: (subPackage) => {
                        const name = normalisePackageName(subPackage);
                
                        if (showLocalProjectsOnly) {
                            return projectNames.includes(name) && packageFilter(name);
                        }
                
                        return packageFilter(name);
                    },
                },
            ),
        }
    });

    return projectTree;
}

async function getNodeModulesTree(nodeModulesPath, { packageFilter, showLocalProjectsOnly, projectNames } = {}) {
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
    subPackages = subPackages.flat().filter(packageFilter);

    // subPackage is "packageName" or "@scoped/packageName" or "@scoped\packageName"
    subPackages = await map(subPackages, async subPackage => {
        const path = join(nodeModulesPath, subPackage);
        const fileInfo = await lstat(path);
        const subModulesPath = join(nodeModulesPath, subPackage, 'node_modules');

        const name = normalisePackageName(subPackage);
        const modules = await getNodeModulesTree(subModulesPath, { packageFilter, showLocalProjectsOnly, projectNames });

        return {
            name: name,
            path: path,
            linkable: projectNames.includes(name),
            linked: fileInfo.isSymbolicLink(),
            root: false,
            modules: modules
        }
    });

    return subPackages;
}

export default getGitTree;