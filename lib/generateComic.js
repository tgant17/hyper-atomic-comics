const path = require('path');
const os = require('os');
const fs = require('fs/promises');
const jimp = require('jimp');

const Jimper = require('../modules/Jimper').constructors;
const GoogleDrive = require('../modules/Jimper/lib/GoogleDrive.js');

const Panel = new Jimper.Panel();

const resolveAssetDir = (envValue, fallback) => {
    if (envValue && envValue.trim().length > 0) {
        return path.resolve(envValue);
    }
    if (fallback && path.isAbsolute(fallback)) {
        return fallback;
    }
    return path.join(process.cwd(), fallback);
};

const ensureDirectoryExists = async (directoryPath) => {
    try {
        await fs.access(directoryPath);
    } catch (err) {
        throw new Error(`Asset directory does not exist: ${directoryPath}`);
    }
};

async function generateComic() {
    const panelsDir = resolveAssetDir(process.env.PANELS_DIR, 'PANELz');
    const backgroundsDir = resolveAssetDir(process.env.BACKGROUNDS_DIR, 'Backgrounds');
    await Promise.all([ensureDirectoryExists(panelsDir), ensureDirectoryExists(backgroundsDir)]);

    const comicCount = await GoogleDrive.getFileCount();
    const { finishedComic, caption, metadata } = await Panel.createComic(backgroundsDir, panelsDir, comicCount);

    const filename = `comic-${comicCount}-${Date.now()}.jpeg`;
    const outputDir = resolveAssetDir(process.env.COMIC_OUTPUT_DIR ?? '', os.tmpdir());
    await fs.mkdir(outputDir, { recursive: true });
    const comicPath = path.join(outputDir, filename);

    const imageBuffer = await finishedComic.getBufferAsync(jimp.MIME_JPEG);
    await finishedComic.writeAsync(comicPath);
    const imageUrl = await GoogleDrive.uploadImage(comicPath);
    await fs.unlink(comicPath).catch(() => {});

    return {
        imageUrl,
        imageData: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
        caption,
        comicNumber: comicCount,
        metadata: {
            ...metadata,
            comicNumber: comicCount
        }
    };
}

module.exports = {
    generateComic
};
