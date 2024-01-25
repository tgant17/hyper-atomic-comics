const jimp = require('jimp');
const path = require('path');
var Helpers = require(path.join(__dirname, 'Helpers'));
var Sheets = require(path.join(__dirname, 'Sheets'));
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
    const {panel, x, y, width, lines, color} = Helpers.getRandomPanel(`${directory}/`);

    const image = await jimp.read(`${directory}/${panel}`);
    const newImage = await image.clone();

    await newImage.resize(1000, 1000);

    const newColor = await Helpers.getColorFont(color ? color : ''); 

    const text = await Sheets.generateText('171bb5GuNoslVI3YCSvi1aiq_prAQrzihgxZRCLHYjVk');
    const font = await jimp.loadFont(path.join(__dirname, '../../../fonts/ComicFontBold.ttf/mTqaubS5npJOK_UcXGL9wFgs.ttf.fnt'));

    var textImage = new jimp(1000,1000, 0x0);
    textImage.print(font, x, y, text, width);
    textImage.color([{apply: 'xor', params: [newColor]}]);
    newImage.blit(textImage, 0, 0);
    return newImage; 
}

/**
 * Creates a comic with the each panel in the images array
 * @param {Array} images [image, image, ...]
 */
Panel.prototype.createComic = async (images) => {
    var size = Math.ceil(images.length/2);
    var comic = new jimp(2000, size*1000, 'white');
    
    images?.forEach(async (image, i) => {
        var j = Math.floor(i/2);
        if(i%2 === 0) {
            await comic.blit(image, 0, j*1000);
        }
        else { 
            await comic.blit(image, 1000, j*1000);
        }

    });
    return comic;
}