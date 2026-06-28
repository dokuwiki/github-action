const core = require('@actions/core');
const process = require('child_process');
const fs = require('fs');
const path = require('path');
const dwUtils = require('../dokuwikiUtils');

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

    const destinationResolved = path.resolve(destinationDir);

    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const destinationPath = path.join(destinationDir, item);

        // never move the destination into itself - the destination may live
        // inside the source directory (e.g. lib/plugins/<base> inside '.')
        const sourceResolved = path.resolve(sourcePath);
        if (destinationResolved === sourceResolved ||
            destinationResolved.startsWith(sourceResolved + path.sep)) {
            continue;
        }

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
 * Installs additional plugins from requirements.txt if it exists
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
    const config = dwUtils.loadExtensionInfo();

    console.log(`Moving plugin to ${config.dir}...`);
    // The destination (e.g. lib/plugins/<base>) lives inside the current
    // directory. Moving the plugin there directly breaks when the plugin ships
    // its own `lib` directory: it collides with the destination path and gets
    // nested into itself endlessly (lib/lib/lib/...). To avoid this we first
    // move everything into a temporary directory and only then into the final
    // destination. See https://github.com/dokuwiki/github-action/issues/8
    const tmpDir = fs.mkdtempSync('.dokuenv-');
    moveContents('.', tmpDir);
    moveContents(tmpDir, config.dir);
    fs.rmdirSync(tmpDir);

    // checkout DokuWiki into current directory (no clone because dir isn't empty)
    console.log(`Cloning DokuWiki ${branch}...`);
    process.execFileSync('git', ['init']);
    process.execFileSync('git', ['pull', 'https://github.com/dokuwiki/dokuwiki.git', branch]);

    installRequirements(config.dir);

    // set outputs
    core.setOutput('type', config.type);
    core.setOutput('dir', config.dir);
    core.setOutput('base', config.base);
    core.setOutput('minphp', config.minphp);
    core.setOutput('maxphp', config.maxphp);
}


try {
    main();
} catch (error) {
    core.setFailed(error.message);
}
