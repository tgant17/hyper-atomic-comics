const { IgApiClient } = require('instagram-private-api');
const { readFile } = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);

const { INSTAGRAM_USER, INSTAGRAM_PASSWORD } = process.env;

function InstagramClient(){}

module.exports = InstagramClient;

/**
 * Creates a new cookie store, connects to instagram, and then creates the post 
 * @param {String} comicPath 
 */
InstagramClient.prototype.postToInsta = async (comicPath, caption) => {
  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(INSTAGRAM_USER);
    await ig.account.login(INSTAGRAM_USER, INSTAGRAM_PASSWORD);
  
    await ig.publish.photo({
      file: await readFileAsync(comicPath),
      caption,
    });
  }
  catch(err) {
    console.log('Login Failed');
    console.log(err);
  }
}