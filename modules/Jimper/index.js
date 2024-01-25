const path = require('path');

exports.constructors = {
    Panel: require(path.join(__dirname, 'lib/Panel.js')),
    Sheets: require(path.join(__dirname, 'lib/Sheets.js')),
    InstagramClient: require(path.join(__dirname, 'lib/InstagramClient.js')),
}