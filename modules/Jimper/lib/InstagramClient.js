const Instagram = require('instagram-web-api');
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
  await client.uploadPhoto({
    photo: comicPath,
    caption: 'atomic comic',
    post: 'feed'
  })
  .then(async (res) => {
    const media = res.media;

    console.log(`https://instagram.com/p/${media.code}`);
  });
}

// /**
//  * Creates a new cookie store, connects to instagram, and then creates the post
//  * @param {String} comicPath 
//  */
// InstagramClient.prototype.makeInstaPost = async (comicPath) => {
//   const cookieStore = new FileCookieStore('./cookies.json');
//   const client = new Instagram({
//     username: INSTAGRAM_USER, 
//     password: INSTAGRAM_PASSWORD,
//     cookieStore
//   },
//   {
//     language: 'en-US'
//   });
  
//   console.log('about to log in');
//   await client.login({ 
//     username: INSTAGRAM_USER, 
//     password: INSTAGRAM_PASSWORD 
//   }, 
//   {
//     _sharedData: false
//   })
//   .then(async () => {
//     console.log('LOGIN GOOD');
//     await instagramPost(client, comicPath);

//   }).catch(async (err) => {
//     console.log('top of error func');
//     if(err.error && err.error.message === 'checkpoint_required') {
//       console.log('checkpoint');
//       var challengeUrl = err.error.checkpoint_url;
//       challengeUrl = challengeUrl.replace('https://www.instagram.com', '');
//       console.log(challengeUrl, typeof challengeUrl);
//       await client.updateChallenge({ challengeUrl, choice: 1 });
//       await instagramPost(client, comicPath);
//     } else {
//       console.log(err, 'EERROROEROREOERO');
//     }
//   });
// }


// rewrite this hoe in a try catch and see if i can get vetter logging

/**
 * Creates a new cookie store, connects to instagram, and then creates the post
 * @param {String} comicPath 
 */
InstagramClient.prototype.makeInstaPost = async (comicPath) => {
  const cookieStore = new FileCookieStore('./cookies.json');
  const client = new Instagram({
    username: INSTAGRAM_USER, 
    password: INSTAGRAM_PASSWORD,
    cookieStore
  },
  {
    language: 'en-US'
  });

  // try and login
  try {
    console.log('about to log in');
    await client.login({ 
      username: INSTAGRAM_USER, 
      password: INSTAGRAM_PASSWORD 
    }, 
    {
      _sharedData: false
    });

    console.log('LOGGED IN');
  }
  catch(error) {
    console.log('ERROR');
    if(error.error && error.error.message === 'checkpoint_required') {
      console.log('checkpoint');
      var challengeUrl = error.error.checkpoint_url;
      challengeUrl = challengeUrl.replace('https://www.instagram.com', '');
      await client.updateChallenge({ challengeUrl, choice: 1 });
      await client.login({ 
        username: INSTAGRAM_USER, 
        password: INSTAGRAM_PASSWORD 
      }, 
      {
        _sharedData: false
      });
      await instagramPost(client, comicPath);
    } else {
      console.log(error, 'EERROROEROREOERO');
    } 
  }
}