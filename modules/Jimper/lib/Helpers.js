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
 * Gets the main character for the comic based on characters in the first panel (randomly)
 * @param {String} charString ex 'abac'
 * @returns {String} Main character
 */
const parseCharacterMap = (charString) => {
    if(charString.length === 1) {
        if(charString[0] === 'z') return false;
        return charString[0];
    }
    return charString[Math.floor(Math.random()*charString.length)];
}

/**
 * Gets characters in the panel
 * @param {String} filename
 * @returns {String} 
 */
Helpers.prototype.getCharacters = (filename) => {
    var data = parsePanelExtension(filename);
    return data[0];
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
        case 'fog':
            color = '#49637b'; break;
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

    var panelData = {
        panel,
        mainChar: parseCharacterMap(data[0]),
        talkingChar: data[0][0],
        x: Number(data[1]), 
        y: Number(data[2]),
        width: Number(data[3]), 
        lines: Number(data[4]), 
        color: data[5]
    };
    return panelData;
}

/**
 * Gets random panel from provided path
 * @param {String} path Path to directory of backgrounds
 * @returns {Object} Configurations about the background
 */
Helpers.prototype.getRandomBackground = (path) => {
    var backgrounds = fs.readdirSync(path);
    backgrounds = backgrounds.filter((b) => {
        var temp = b.match(/^\./g);
        return !temp;
    });

    var background = backgrounds[Math.floor(Math.random()*backgrounds.length)];
    var data = parsePanelExtension(background);

    return {
        background,
        color: data[0]
    };
}

/**
 * Gets the fullname of all characters in the character string
 * @param {String} characters 'abac'
 * @returns {Array} {Characters}
 */
Helpers.prototype.getFullNameCharacters = (characters) => {
    var set = new Set();
    for(const char of characters) {
        if(char === 'z' || char === 'o' || char === 'y') continue;
        set.add(char);
    }
    var charMap = {
        'a': 'Alien',
        'c': 'Campfire',
        'f': 'Foggy',
        'r': 'Robot',
        't': 'Toast Ghost',
    }

    var fullNameChars = [];
    for(const char of set) {
        fullNameChars.push(charMap[char]);
    }
    return fullNameChars;
}

/**
 * Gets current date and time
 * @returns {Object} Current Date and Time
 */
Helpers.prototype.getCurrentDate = () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var ss = today.getSeconds();
    var MM = today.getMinutes();
    var HH = today.getHours()

    var date = mm + '/' + dd + '/' + yyyy;
    var time = `${HH}:${MM}:${ss}`;
    return {date, time};
}
