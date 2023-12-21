const jimp = require('jimp');
const fs = require('fs');

function Helpers(){}
module.exports = Helpers;

/**
 * Parses the panels file extension to get information about the 
 * panels desired text placement
 * @param {String} filename 
 * @returns Array
 */
const parsePanelExtension = (filename) => {
    var start = filename.indexOf('-');
    var end = filename.indexOf('.');
    var data = filename.slice(start+1, end);
    data = data.split('-');
    return data.map(item => Number(item));
}   

/**
 * Changes the color of a font passed in from jimp
 * @param {Object} {color: string, size: number} 
 * @returns {Object} {textImage: image, fontReference: string, color: string}
 */
Helpers.prototype.getColorFont = async (options) => {
    var fontReference;
    var {color, size} = options;

    switch(color?.toLowerCase()) {
        case 'red':
            color = '#FF0000'; break;
        case 'blue':
            color = '#0000FF'; break;
        case 'yellow': 
            color = '#FFFF00'; break;
        case 'green': 
            color = '#008000'; break;
        default: 
            color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
            break;
    };
    switch(size) {
        case 8: 
            fontReference = 'FONT_SANS_8_BLACK'; break;
        case 10: 
            fontReference = 'FONT_SANS_10_BLACK'; break;
        case 12: 
            fontReference = 'FONT_SANS_12_BLACK'; break;
        case 14: 
            fontReference = 'FONT_SANS_14_BLACK'; break;
        case 16: 
            fontReference = 'FONT_SANS_16_BLACK'; break;
        case 32: 
            fontReference = 'FONT_SANS_32_BLACK'; break;
        case 64: 
            fontReference = 'FONT_SANS_64_BLACK'; break;
        default: 
            fontReference = 'FONT_SANS_32_BLACK'; break;
    };

    var textImage = new jimp(1000,1000, 0x0);
    var fontReference = await jimp.loadFont(jimp[fontReference]);
    return {
        textImage, 
        fontReference, 
        color
    };
}

/**
 * Gets random panel from provided directory
 * @param {String} path Path to directory of comic panels
 * @return {Object} Configurations about the panel
 */
Helpers.prototype.getRandomPanel = (path) => {
    var panels = fs.readdirSync(path);
    panels = panels.filter((p) => {
        var temp = p.match(/^\./g);
        return !temp;
    });
    var panel = panels[Math.floor(Math.random()*panels.length)];
    var data = parsePanelExtension(panel);

    return {
        panel,
        x: data[0], 
        y: data[1],
        width: data[2], 
        lines: data[3],
    };
}
