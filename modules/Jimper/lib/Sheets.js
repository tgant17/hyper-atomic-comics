const {GoogleSpreadsheet} = require('google-spreadsheet');
const {JWT} = require('google-auth-library');
const creds = require('../../../peppy-linker-384511-5ae613a1c79e.json'); // the file saved above


function Sheets(){}
module.exports = Sheets;

// builds the string and ensures that the empty string is not used more than once
// using the emptyString flag
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

Sheets.prototype.generateText = async () => {

    const SCOPES = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ];
    
    const jwt = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet('171bb5GuNoslVI3YCSvi1aiq_prAQrzihgxZRCLHYjVk', jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const columnLength = 2;

    return buildTextString(rows, columnLength);
}