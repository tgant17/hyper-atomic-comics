// --------------------------------------------------- //
// : Hypersomnia's Automatic Comic Generator           //
// : Generates a random comic at a set interval        //
// : Version - 1.3.0                                   //
// : > node main.js <imageDir>/                        // 
// --------------------------------------------------- // 
require('dotenv').config();
const path = require('path');
const Jimper = require(path.join(__dirname, 'modules/Jimper')).constructors;
const Panel = new Jimper.Panel();
const InstagramClient = new Jimper.InstagramClient();

/**
 * Runs the program
 * Creates 4 panels and combines them all into one comic
 */
const main = async () => {
    if(process.argv.length < 4) {
        console.error('4 Arguments must be provided!');
        return
    }
    const imagePath = process.argv[2];
    const backgroundPath = process.argv[3];

    const {finishedComic, caption} = await Panel.createComic(backgroundPath, imagePath);
    await finishedComic.writeAsync(`output.jpg`);
    await InstagramClient.postToInsta('output.jpg', caption);
}

console.log('Running every morning at 7:00am :)\nOr when kabuto wakes.\nAtomic Comic Generating...');
main();
