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
    return data; 
}   

/**
 * Changes the color of a font
 * @param {String} color 
 * @returns {String} color 
 */
Helpers.prototype.getColorFont = async (color) => {
    switch(color?.toLowerCase()) {
        case 'black':
            color = '#000000'; break;
        case 'white':
            color = '#FFFFFF'; break;
        case 'red':
            color = '#FF0000'; break;
        case 'blue':
            color = '#0000FF'; break;
        case 'yellow': 
            color = '#FFFF00'; break;
        case 'green': 
            color = '#008000'; break;
        case 'lime': 
            color = '#9cc764'; break;
        case 'fire':
            color = '#a06f33'; break;
        default: 
            color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
            break;
    };

    return color;
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
        x: Number(data[0]), 
        y: Number(data[1]),
        width: Number(data[2]), 
        lines: Number(data[3]),
        color: data[4]
    };
}
