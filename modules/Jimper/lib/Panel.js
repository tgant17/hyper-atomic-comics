const jimp  = require('jimp');
const path  = require('path');
const OpenAIConstructor  = require('./OpenAi');
const HelpersConstructor = require('./Helpers');
const SheetsConstructor  = require('./Sheets');

const Helpers = new HelpersConstructor();
const Sheets = new SheetsConstructor();
const OpenAI = new OpenAIConstructor();

const FONT_PATH = path.join(process.cwd(), 'fonts/ComicFontBold.ttf/mTqaubS5npJOK_UcXGL9wFgs.ttf.fnt');
let cachedFont;

const getFont = async () => {
    if (!cachedFont) {
        cachedFont = await jimp.loadFont(FONT_PATH);
    }
    return cachedFont;
};

function Panel(){}
module.exports = Panel;

/**
 * Adds the title and supporting text to the comic
 * @param {Image} comic 
 * @param {String} title 
 * @param {String} color 
 * @param {String} comicCount  
 * @returns Image
 */
const addTitleText = async (comic, title, color, comicCount) => {

    const font = await getFont();
    var newColor = await Helpers.getColorFont(color ? color : '');
    let completeTitle = `Comic #${comicCount} * ${title}`;

    // top text
    var textImage = new jimp(2000, 2000, 0x0);
    textImage.print(font, 60, 10, completeTitle, 1000);
    textImage.color([{apply: 'xor', params: [newColor]}]);
    comic.blit(textImage, 0, 0);

    // bottom left text
    var textImage2 = new jimp(2000, 2000, 0x0);
    textImage2.print(font, 60, 1940, 'For more check out: hypersomnia.store', 1500);
    textImage2.color([{apply: 'xor', params: [newColor]}]);
    comic.blit(textImage2, 0, 0);

    // bottom right text
    var textImage3 = new jimp(2000, 2000, 0x0);
    textImage3.print(font, 1650, 1940, '@hyperzzzomnia', 1500);
    textImage3.color([{apply: 'xor', params: [newColor]}]);
    comic.blit(textImage3, 0, 0);

    return comic;
}

/**
 * Adds text to a panel
 * @param {Jimp{Image}} panel 
 * @param {*} options panel options
 * @returns null
 */
const addPanelText = async (panel, x, y, width, text, color) => {
    const font = await getFont();
    var textImage = new jimp(1000,1000, 0x0);
    var newColor = await Helpers.getColorFont(color ? color : ''); 

    textImage.print(font, x, y, text, width);
    textImage.color([{apply: 'xor', params: [newColor]}]);

    await panel.blit(textImage, 0, 0);
    return;
}

/**
 * Creates a panel for the comic
 * @param {String} directory 
 * @returns Image
 */
const createPanel = async (directory, focus) => {
    var {panel, 
         mainChar, 
         x, 
         y, 
         width, 
         lines, 
         color, 
         talkingChar} = Helpers.getRandomPanel(`${directory}/`);

    // if focus exists and the current panel is not a transition 
    if(focus && mainChar !== 'z') {
        while(mainChar !== focus) {
            var {panel, 
                mainChar, 
                x, 
                y, 
                width, 
                lines, 
                color, 
                talkingChar} = Helpers.getRandomPanel(`${directory}/`);
            var chars = Helpers.getCharacters(panel);
            if(chars.includes(focus)) {
                mainChar = focus;
            }
        }
    }

    const image = await jimp.read(path.join(directory, panel));
    const newImage = await image.clone();

    await newImage.resize(1000, 1000);

    var panelData = {
        panel: newImage, 
        mainChar,
        color,
        x, 
        y,
        width, 
        talkingChar,
        path: panel
    }; 
    return panelData
}

/**
 * Creates a 4 panel comic
 * @param {String} backgroundPath 
 * @param {String} panelPath
 */
Panel.prototype.createComic = async (backgroundPath, panelPath, comicCount) => {
    var {background, color} = Helpers.getRandomBackground(`${backgroundPath}/`);
    var comic = await jimp.read(path.join(backgroundPath, background));

    var {seed, title, adjective, noun} = await Sheets.getComicSeed(process.env.SHEETS_KEY);
    var metadata = {
        seed,
        title,
        adjective,
        noun
    };

    var newComic = await comic.clone();
    await newComic.resize(2000, 2000);

    var panel = await createPanel(panelPath, null);
    var panel2 = await createPanel(panelPath, panel.mainChar);
    var panel3 = await createPanel(panelPath, panel2.mainChar);
    var panel4 = await createPanel(panelPath, panel3.mainChar);
    
    const images = [panel, panel2, panel3, panel4];
    var talkingChars = panel.talkingChar + panel2.talkingChar + panel3.talkingChar + panel4.talkingChar
    var fullNameChars = Helpers.getFullNameCharacters(talkingChars);
    var {date, time} = Helpers.getCurrentDate();

    var caption = `"${adjective} ${noun}" is a comic about `;
    fullNameChars.forEach((item, i) => {
        caption += `${item}`;
        if(i+1 !== fullNameChars.length) {
            if(i+2 === fullNameChars.length) {

                caption += ' and '
            }
            else {
                caption += ', '
            }
        }
    });
    caption += `\n\nGenerated at ${time} - ${date}`
    caption += `\n\n\n\n#comic #random #generator #comicstrips #automation #ai #ghost #alien #art #cartoon #handdrawn #drawing`;
    
    console.log(talkingChars);
    console.log(`Background -- ${background}`);
    images.forEach((item) => {
        console.log(`Panel      -- ${item.path}`);
    });
    console.log(caption);

    var text = await OpenAI.generateComicText(seed, title, talkingChars);
    text = text.conversation;
    console.log('Text       -- ', text);

    await Promise.all(images.map(async (image, i) => {
        var {panel, x, y, width, color} = image;
        var j = Math.floor(i/2);
        var line = Array.isArray(text) ? text[i] ?? '' : '';

        if(i%2 === 0) {
            await addPanelText(panel, x, y, width, line, color);
            await newComic.blit(panel, 0, j*1000);
        }
        else { 
            await addPanelText(panel, x, y, width, line, color);
            await newComic.blit(panel, 1000, j*1000);
        }
    }));
    
    var finishedComic = await addTitleText(newComic, title, color, comicCount);
    metadata = {
        ...metadata,
        background,
        talkingChars,
        panels: images.map((item) => item.path)
    };
    return {finishedComic, caption, metadata};
}
