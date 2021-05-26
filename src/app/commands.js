const { promisify } = require('util');
const { exec } = require('child_process');
const execAsync = promisify(exec);

export async function link(project, packageProject) {
    const { stdout, stderr } = await execAsync(`npm link ${packageProject.path}`, { cwd: project.path });

    if (stderr) {
        throw new Error('Linking error:', stderr);
    }

    return stdout;
}

export async function unlink(project, packageProject) {
    const { stdout, stderr } = await execAsync(`npm unlink --no-save ${packageProject.path}`, { cwd: project.path });

    if (stderr) {
        console.error(stderr);
        throw new Error('Unlinking error. Log above.');
    }

    return stdout;
}

export async function ci(project) {
    const { stdout, stderr } = await execAsync(`npm ci ${project.path}`, { cwd: project.path });

    if (stderr) {
        console.error(stderr);
        throw new Error('NPM CI error. Log above.');
    }

    return stdout;
}