const core = require('@actions/core');
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

async function main() {
    /**
     * these are the default versions for each branch
     * @fixme ideally we would load this from the dokuwiki repo
     */
    const defaults = {
        stable: [7.2, 7.3, 7.4, 8.0, 8.1, 8.2],
        master: [7.4, 8.0, 8.1, 8.2],
    }

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
