const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

/**
 * Authenticates the application using Google Auth with the specified credentials file.
 * 
 * @returns {Promise<google.auth.GoogleAuth>} A promise that resolves to the GoogleAuth instance.
 */
const authenticate = async () => {
	const credentialFilename = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH;
	const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

	const auth = new google.auth.GoogleAuth({
		keyFile: credentialFilename,
		scopes: SCOPES
  	});
  	return auth; 
}

const getFileCount = async () => {
	const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; 
	const auth = await authenticate();
	const drive = google.drive({version: 'v3', auth});

	const response = await drive.files.list({
		q: `'${folderId}' in parents`,
		fields: 'files(id)',
	});

  const fileCount = response.data.files.length;
  console.log(fileCount);
  return fileCount; 
}

/**
 * Uploads an image file to Google Drive.
 *
 * @param {String} _filePath - The path to the image file to be uploaded.
 * @returns {Promise<String>} - A String of the files public URL
 *
 * This function authenticates with Google Drive using credentials specified in the
 * environment variable GOOGLE_DRIVE_CREDENTIALS_PATH. It uploads the specified image
 * file to the Google Drive folder identified by the environment variable
 * GOOGLE_DRIVE_FOLDER_ID. The file is uploaded with the MIME type 'image/jpeg'.
 * If an error occurs during the upload process, it is logged to the console.
 */
async function uploadImage(_filePath) {
	const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; 
	const auth = await authenticate();
	const drive = google.drive({version: 'v3', auth});

	const fileMetadata = {
		'name': path.basename(_filePath), 
		'parents': [folderId]
	};
	const media = {
		mimeType: 'image/jpeg',
		body: fs.createReadStream(_filePath)
	};
	try {
		// API Reference - https://developers.google.com/drive/api/reference/rest/v3/files/create
		const file = await drive.files.create({
		  resource: fileMetadata,
		  media: media,
		  fields: 'id'
		});

		const fileURL = `https://drive.google.com/uc?export=download&id=${file.data.id}`;
		console.log(fileURL); // extract public id to post to instagram
		return fileURL
		
  } catch (error) {
	console.error('Error uploading file:', error);
  }
}

module.exports = {
	getFileCount,
	uploadImage
};