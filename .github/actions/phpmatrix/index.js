const core = require('@actions/core');
const yaml = require('js-yaml');
const dwUtils = require('../dokuwikiUtils');

/**
 * Convert to string, keeping one decimal place
 *
 * @param {Number} num
 * @returns {string}
 */
function toNumberString(num) {
    if (Number.isInteger(num)) {
        return num + ".0"
    } else {
        return num.toString();
    }
}

/**
 * Load the PHP versions to test against by default from the dokuwiki repo
 *
 * @returns {Promise<{stable: *[], master: *[]}>}
 */
async function fetchPHPVersions() {
    const defaults = {
        stable: [],
        master: [],
    }

    for (const [branch, ] of Object.entries(defaults)) {
        const url = `https://raw.githubusercontent.com/dokuwiki/dokuwiki/${branch}/.github/workflows/testLinux.yml`
        const response = await fetch(url);
        const body = await response.text()
        const doc = yaml.load(body);
        defaults[branch] = doc.jobs.run.strategy.matrix['php-versions'];
    }
    console.log('Default PHP Versions:', defaults);
    return defaults;
}

async function main() {
    const defaults = await fetchPHPVersions();

    const matrix = {
        stable: {
            'dokuwiki-branch': ['stable'],
            'php-version': []
        },
        master: {
            'dokuwiki-branch': ['master'],
            'php-version': []
        }
    };

    let minphp = 1000;

    const config = dwUtils.loadExtensionInfo();

    // iterate over versions, only adding those that are in range for the plugin
    for (const [branch, versions] of Object.entries(defaults)) {
        for (const php of versions) {
            if (config.minphp !== '' && parseFloat(config.minphp) > php) {
                continue;
            }
            if (config.maxphp !== '' && parseFloat(config.maxphp) < php) {
                continue;
            }
            matrix[branch]['php-version'].push(toNumberString(php));
            if (php < minphp) {
                minphp = php; // remember the lowest version
            }
        }
    }

    // output the matrix
    core.setOutput('stable_matrix', JSON.stringify(matrix.stable));
    core.setOutput('master_matrix', JSON.stringify(matrix.master));
    core.setOutput('minphp', toNumberString(minphp));
}


try {
    main();
} catch (error) {
    core.setFailed(error.message);
}
