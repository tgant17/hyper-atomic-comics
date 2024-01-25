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
 * @param {String} backgroundPath
 * @param {Array} images [image, image, ...]
 */
Panel.prototype.createComic = async (backgroundPath, images) => {
    var {background, color} = Helpers.getRandomBackground(`${backgroundPath}/`);
    var comic = await jimp.read(`${backgroundPath}/${background}`)

    var newComic = await comic.clone();
    await newComic.resize(2000, 2000);
    
    images?.forEach(async (image, i) => {
        var j = Math.floor(i/2);
        if(i%2 === 0) {
            await newComic.blit(image, 0, j*1000);
        }
        else { 
            await newComic.blit(image, 1000, j*1000);
        }
    });

    var font = await jimp.loadFont(path.join(__dirname, '../../../fonts/ComicFontBold.ttf/mTqaubS5npJOK_UcXGL9wFgs.ttf.fnt'));
    var newColor = await Helpers.getColorFont(color ? color : '');

    // top text
    var textImage = new jimp(2000, 2000, 0x0);
    textImage.print(font, 60, 10, 'Comic Title', 400);
    textImage.color([{apply: 'xor', params: [newColor]}]);
    newComic.blit(textImage, 0, 0);

    // bottom left text
    var textImage2 = new jimp(2000, 2000, 0x0);
    textImage2.print(font, 60, 1940, 'For more check out: hypersomnia.store', 1500);
    textImage2.color([{apply: 'xor', params: [newColor]}]);
    newComic.blit(textImage2, 0, 0);

    // bottom right text
    var textImage3 = new jimp(2000, 2000, 0x0);
    textImage3.print(font, 1650, 1940, '@hyperzzzomnia', 1500);
    textImage3.color([{apply: 'xor', params: [newColor]}]);
    newComic.blit(textImage3, 0, 0);

    return newComic;
}