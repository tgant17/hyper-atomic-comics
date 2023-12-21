const jimp = require('jimp');

var Helpers = require('./Helpers');
var Sheets = require('./Sheets');
Helpers = new Helpers();
Sheets = new Sheets();

function Panel(){}
module.exports = Panel;


Panel.prototype.createPanel = async (directory) => {
    const {x, y, width, lines, panel} = Helpers.getRandomPanel(`${directory}/`);
    
    const image = await jimp.read(`images/${panel}`);
    const newImage = await image.clone();

    await newImage.resize(1000, 1000);

    const {textImage, color, fontReference } = await Helpers.getColorFont({color: 'red', size: 32}); 
    const text = await Sheets.generateText(width, lines);


    textImage.print(fontReference, x, y, text, width);
    textImage.color([{apply: 'xor', params: [color]}]);
    newImage.blit(textImage, 0, 0);
    return newImage; 
}

// images is an array
Panel.prototype.createComic = async (images) => {
    var comic = new jimp(images?.length*1000, 1000, 'white');
    
    images?.forEach(async (image, i) => {
            await comic.blit(image, i*1000,0);
    });
    comic.writeAsync(`output.png`);
}