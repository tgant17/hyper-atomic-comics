const {GoogleSpreadsheet} = require('google-spreadsheet');
const {JWT} = require('google-auth-library');
const creds = require('../../../peppy-linker-384511-5ae613a1c79e.json'); // the file saved above

function Sheets(){}
module.exports = Sheets;


/**
 * Builds a text string from each Phrase column
 * Ensures the empty string is not used more than once
 * @param {Array} rows 
 * @param {String} columnLength 
 * @returns {String} text string
 */
const buildTextString = (rows, columnLength) => {
    var text = '';
    var emptyString = false; 

    for(var i=0; i<columnLength; i++) {
        var randomIndex = Math.floor(Math.random() * (rows.length));
        if(randomIndex === 0) {
            if(emptyString) {
                while(randomIndex === 0) {
                    randomIndex = Math.floor(Math.random() * (rows.length));
                }
            }
            emptyString = true;
        }
        text += ` ${rows[randomIndex].get(`Phrase${i+1}`)}`;
    }
    return text.trim();
} 

/**
 * Generates a random text string from a google sheet
 * @param {String} sheetId A google sheets id (found in URL)
 * @returns {String} A randomly generated text string from the provided google sheet 
 */
Sheets.prototype.generateText = async (sheetId) => {

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
    const columnLength = 2;

    return buildTextString(rows, columnLength);
}