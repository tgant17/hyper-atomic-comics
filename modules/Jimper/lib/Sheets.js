const {GoogleSpreadsheet} = require('google-spreadsheet');
const {JWT} = require('google-auth-library');

function Sheets(){}
module.exports = Sheets; 

/**
 * Gets a random row for the column header provided
 * @param {} rows 
 * @param {String} header Name of column
 * @returns {String}
 */
const getRandomRow = (rows, header) => {
    return rows[Math.floor(Math.random() * (rows.length))].get(header);
}

/**
 * Generates a random text string from a google sheet
 * @param {String} sheetId A google sheets id (found in URL)
 * @returns {String} A randomly generated text string from the provided google sheet 
 */
Sheets.prototype.getComicSeed = async (sheetId) => {

    const SCOPES = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ];
    
    const jwt = new JWT({
      email: process.env.SHEETS_CLIENT_EMAIL,
      key: process.env.SHEETS_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(sheetId, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    var seed = getRandomRow(rows, 'Phrases');
    var title = `${getRandomRow(rows, 'Adjectives')} ${getRandomRow(rows, 'Nouns')}`;

    return {
        seed,
        title
    }
}