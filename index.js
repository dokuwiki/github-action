const core = require('@actions/core');
const process = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Detects if we are in a plugin or template repo and returns the target directory
 *
 * @returns {string}
 */
function getTargetDir() {
    let type = '';
    let dir = '';
    let info = '';
    if (fs.existsSync('plugin.info.txt')) {
        type = 'plugin';
        dir = 'plugins';
        info = 'plugin.info.txt';
    } else if (fs.existsSync('template.info.txt')) {
        type = 'template';
        dir = 'tpl';
        info = 'template.info.txt';
    } else {
        throw new Error('No plugin.info.txt or template.info.txt found!');
    }

    const data = fs.readFileSync(info, 'utf8');
    const lines = data.split('\n');
    const baseLine = lines.find(line => line.trim().startsWith('base'));
    if (!baseLine) {
        throw new Error('No base found in info file!');
    }
    const [, base] = baseLine.split(/\s+/);
    const targetDir = `lib/${dir}/${base}`;

    core.setOutput('type', type);
    core.setOutput('dir', targetDir);
    core.setOutput('base', base);

    return targetDir;
}

/**
 * Moves all contents of a directory to another directory
 *
 * @param {string} sourceDir
 * @param {string} destinationDir
 */
function moveContents(sourceDir, destinationDir) {
    // read contents first
    const items = fs.readdirSync(sourceDir);

    // then create destination dir if it doesn't exist
    if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, {recursive: true});
    }

    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const destinationPath = path.join(destinationDir, item);

        const stats = fs.statSync(sourcePath);

        if (stats.isFile()) {
            fs.renameSync(sourcePath, destinationPath);
        } else if (stats.isDirectory()) {
            moveContents(sourcePath, destinationPath);
            fs.rmdirSync(sourcePath);
        }
    }
}

/**
 * Installs additional plugin from requirements.txt if it exists
 */
function installRequirements(dir) {
    if (!fs.existsSync(`${dir}/requirements.txt`)) {
        return;
    }

    console.log('Installing requirements...');
    const data = fs.readFileSync(`${dir}/requirements.txt`, 'utf8');
    const lines = data.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) {
            continue;
        }
        const [src, dst] = line.split(/\s+/);

        console.log(`Cloning ${src} to ${dst}...`);
        process.execFileSync('git', ['clone', src, dst]);
    }
}

async function main() {
    const branch = core.getInput('branch', {required: true});
    const targetDir = getTargetDir();

    console.log(`Moving plugin to ${targetDir}...`);
    moveContents('.', targetDir);

    // checkout DokuWiki into current directory (no clone because dir isn't empty)
    console.log(`Cloning DokuWiki ${branch}...`);
    process.execFileSync('git', ['init']);
    process.execFileSync('git', ['pull', 'https://github.com/dokuwiki/dokuwiki.git', branch]);

    installRequirements(targetDir);
}


try {
    main();
} catch (error) {
    core.setFailed(error.message);
}
