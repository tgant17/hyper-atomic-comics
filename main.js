// --------------------------------------------------- //
// : Hypersomnia's Automatic Comic Generator           //
// : Generates a random comic at a set interval        //
// : Version - 1.1.0                                   //
// : > node main.js <imageDir>/                          // 
// --------------------------------------------------- // 
require('dotenv').config();
const Jimper = require('./modules/Jimper').constructors;
const Panel = new Jimper.Panel();
const InstagramClient = new Jimper.InstagramClient();

/**
 * Runs the program
 * Creates 4 panels and combines them all into one comic
 */
const main = async () => {
    if(process.argv.length < 3) {
        console.error('3 Arguments must be provided!');
        return
    }
    const imagePath = process.argv[2];
    const panel = await Panel.createPanel(imagePath); 
    const panel2 = await Panel.createPanel(imagePath); 
    const panel3 = await Panel.createPanel(imagePath); 
    const panel4 = await Panel.createPanel(imagePath); 
    const comic = await Panel.createComic([panel, panel2, panel3, panel4]);
    await comic.writeAsync(`output.jpg`);
    await InstagramClient.makeInstaPost('output.jpg');
}

console.log('Running every morning at 6:00 :)\nAtomic Comic Generating...');
main();
