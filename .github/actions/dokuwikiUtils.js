const fs = require('fs');

/**
 * Get the extension info from the info file and set the type and dir
 *
 * @returns {{}}
 */
function loadExtensionInfo() {
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

    const config = parsePluginInfo(info);
    if (!config.base) {
        throw new Error('No base found in info file!');
    }
    const targetDir = `lib/${dir}/${config.base}`;
    config.type = type;
    config.dir = targetDir;

    console.log('Extension info:', config);
    return config;
}

/**
 * Parses a plugin.info.txt file into an object
 *
 * @param {string} filePath
 * @returns {{}}
 */
function parsePluginInfo(filePath) {
    const configData = fs.readFileSync(filePath, 'utf8');
    const lines = configData.split('\n');
    const configObject = {
        base: '',
        minphp: '',
        maxphp: '',
    };

    for (const line of lines) {
        const [key, value] = line.trim().split(/\s+/);
        if (key && value) {
            configObject[key] = value;
        }
    }

    return configObject;
}


module.exports = {
    loadExtensionInfo,
}
