const jimp = require('jimp');
var Helpers = require('./Helpers');
var Sheets = require('./Sheets');
Helpers = new Helpers();
Sheets = new Sheets();

function Panel(){}
module.exports = Panel;


/**
 * Creates a panel for the comic
 * @param {String} directory 
 * @returns Image
 */
Panel.prototype.createPanel = async (directory) => {
    const {x, y, width, lines, panel} = Helpers.getRandomPanel(`${directory}/`);

    const image = await jimp.read(`images/${panel}`);
    const newImage = await image.clone();

    await newImage.resize(1000, 1000);

    const {textImage, color, fontReference } = await Helpers.getColorFont({color: 'red', size: 32}); 
    const text = await Sheets.generateText('171bb5GuNoslVI3YCSvi1aiq_prAQrzihgxZRCLHYjVk');

    textImage.print(fontReference, x, y, text, width);
    textImage.color([{apply: 'xor', params: [color]}]);
    newImage.blit(textImage, 0, 0);
    return newImage; 
}

/**
 * Creates a comic with the each panel in the images array
 * @param {Array} images [image, image, ...]
 */
Panel.prototype.createComic = async (images) => {
    var comic = new jimp(images?.length*1000, 1000, 'white');
    
    images?.forEach(async (image, i) => {
        await comic.blit(image, i*1000,0);
    });
    return comic;
}