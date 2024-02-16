const fs = require('fs')
const path = require('path');

const Instagram = require(path.join(__dirname, '../../../instagram-web-api/index'));
const FileCookieStore = require('tough-cookie-filestore2');
const { INSTAGRAM_USER, INSTAGRAM_PASSWORD } = process.env;

function InstagramClient(){}

module.exports = InstagramClient;

/**
 * Posts the comic on Instagram
 * https://www.instagram.com/hyper_atomic_comics/
 * @param {Client} client 
 * @param {String} comicPath 
 */
const instagramPost = async (client, comicPath) => {
  try {
    const res = await client.uploadPhoto({
      photo: comicPath,
      caption: 'atomic comic',
      post: 'feed'
    });
    console.log(`https://instagram.com/p/${res.media.code}`);
    return;
  }
  catch(err) {
    console.log(err);
    return err;
  }
}

/**
 * Creates a new cookie store, connects to instagram, and then creates the post
 * @param {String} comicPath 
 */
InstagramClient.prototype.makeInstaPost = async (comicPath) => {
  try {
    const cookieStore = new FileCookieStore('./cookies.json');
    const client = new Instagram({
      username: INSTAGRAM_USER, 
      password: INSTAGRAM_PASSWORD,
      cookieStore
    },{language: 'en-US'});
  
    console.log('Logging in...');
    await client.login({ username: INSTAGRAM_USER, password: INSTAGRAM_PASSWORD }, { _sharedData: false });
    const photos = await client.getPhotosByUserName({username: INSTAGRAM_USER});

    console.log(photos);
    console.log('Logged in. \nMaking post...');
    await instagramPost(client, comicPath);
  }
  catch(err) {
    console.log('Login failed.');
    console.log("Logging in again and setting new cookie store");
    
    // Delete stored cookies, if any, and log in again
    await fs.unlinkSync("./cookies.json");
    const newCookieStore = new FileCookieStore("./cookies.json");
    const newClient = new Instagram(
      {
        username: process.env.INSTAGRAM_USERNAME,
        password: process.env.INSTAGRAM_PASSWORD,
        cookieStore: newCookieStore,
      },
      {
        language: "en-US",
      }
    );

    const delayedNewLoginFunction = async (timeout) => {
      setTimeout(async () => {
        await newClient
          .login()
          .then(() => instagramPost(newClient, comicPath))
          .catch((err) => {
            console.log(err);
            console.log("Login failed again!");
          });
      }, timeout);
    };
    await delayedNewLoginFunction(10000);
  }
}