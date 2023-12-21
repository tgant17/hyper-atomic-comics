// --------------------------------------------------- //
// : Hypersomnia's Automatic Comic Generator           //
// : Generates a random comic at a set interval        //
// : > node main.js
// --------------------------------------------------- // 
const cron = require('node-cron');
const Jimper = require('./modules/Jimper').constructors;
const Panel = new Jimper.Panel();

/**
 * Runs the program
 * Creates 4 panels and combines them all into one comic
 */
const main = async () => {
    const panel = await Panel.createPanel('images'); 
    const panel2 = await Panel.createPanel('images'); 
    const panel3 = await Panel.createPanel('images'); 
    const panel4 = await Panel.createPanel('images'); 
    const comic = await Panel.createComic([panel, panel2, panel3, panel4]);
    comic.writeAsync(`output.png`);
}

cron.schedule('*/30 * * * * *', () => {
    console.log('running every 30 seconds');
    main();
});