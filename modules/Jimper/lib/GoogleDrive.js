const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const getCredentialsFromEnv = () => {
	const raw = process.env.GOOGLE_DRIVE_CREDENTIALS_JSON;
	if (!raw) return null;

	try {
		if (raw.trim().startsWith('{')) {
			return JSON.parse(raw);
		}
		const decoded = Buffer.from(raw, 'base64').toString('utf-8');
		return JSON.parse(decoded);
	} catch (err) {
		throw new Error('Invalid GOOGLE_DRIVE_CREDENTIALS_JSON content.');
	}
};

/**
 * Authenticates the application using Google Auth with credentials sourced from env vars
 * or fallback credentials file.
 */
const authenticate = async () => {
	const credentials = getCredentialsFromEnv();
	const credentialFilename = process.env.GOOGLE_DRIVE_CREDENTIALS_PATH;

	if (!credentials && !credentialFilename) {
		throw new Error('Set GOOGLE_DRIVE_CREDENTIALS_JSON or GOOGLE_DRIVE_CREDENTIALS_PATH.');
	}

	const auth = new google.auth.GoogleAuth({
		scopes: SCOPES,
		...(credentials ? { credentials } : { keyFile: credentialFilename })
  	});
  	return auth; 
}

const getDriveClient = async () => {
	const auth = await authenticate();
	return google.drive({ version: 'v3', auth });
};

const getFileCount = async () => {
	const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; 
	const drive = await getDriveClient();

	const response = await drive.files.list({
		q: `'${folderId}' in parents`,
		fields: 'files(id)',
	});

	const fileCount = response.data.files.length;
	console.log(fileCount);
	return fileCount; 
};

const getLatestFileTimestamp = async () => {
	const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
	const drive = await getDriveClient();

	const response = await drive.files.list({
		q: `'${folderId}' in parents`,
		orderBy: 'createdTime desc',
		pageSize: 1,
		fields: 'files(id, createdTime)'
	});

	const latest = response.data.files?.[0];
	return latest?.createdTime ?? null;
};

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
	const drive = await getDriveClient();

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
	getLatestFileTimestamp,
	uploadImage
};
