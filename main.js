// --------------------------------------------------- //
// : Hypersomnia's Automatic Comic Generator           //
// : Generates a random comic at a set interval        //
// : Version - 0.1.0                                   //
// : > node main.js input/                             // 
// --------------------------------------------------- // 
require('dotenv').config();
const cron = require('node-cron');
const Jimper = require('./modules/Jimper').constructors;
const Panel = new Jimper.Panel();

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
    await comic.writeAsync(`output.png`);
}

cron.schedule('*/30 * * * * *', () => {
    console.log('running every 30 seconds');
    main();
});