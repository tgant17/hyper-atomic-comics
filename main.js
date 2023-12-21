// CLEAN THIS SHIT UP YO
const cron = require('node-cron');
const Jimper = require('./modules/Jimper').constructors;
const Panel = new Jimper.Panel();

const main = async () => {
    const panel = await Panel.createPanel('images'); 
    const panel2 = await Panel.createPanel('images'); 
    const panel3 = await Panel.createPanel('images'); 
    const panel4 = await Panel.createPanel('images'); 
    await Panel.createComic([panel, panel2, panel3, panel4]);
}

cron.schedule('*/30 * * * * *', () => {
    console.log('running every 5 seconds');
    main();
});

// main();