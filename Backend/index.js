/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

require('dotenv').config();
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = process.env.SPOTIFY_CLIENT_ID;
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;
var redirect_uri = process.env.REDIRECT_URI;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/../Frontend'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read user-library-read';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
          console.log(body);
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

app.get('/search', function(req, res) {
  const access_token = req.query.access_token;
  const query = req.query.q;

  if (!access_token || !query) {
    return res.status(400).json({ error: 'Missing access_token or query parameter' });
  }

  const options = {
    url: `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  request.get(options, function(error, response, body) {
    if (error) {
      return res.status(500).json({ error: 'Error searching tracks' });
    }
    res.json(body);
  });
});

app.get('/saved-tracks', function(req, res) {
  const access_token = req.query.access_token;

  if (!access_token) {
    return res.status(400).json({ error: 'Missing access_token parameter' });
  }

  const options = {
    url: 'https://api.spotify.com/v1/me/tracks?limit=50',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  };

  request.get(options, function(error, response, body) {
    if (error) {
      return res.status(500).json({ error: 'Error fetching saved tracks' });
    }
    res.json(body);
  });
});



app.get('/top-tracks', function(req, res) {
  const access_token = req.query.access_token;
  const time_range = req.query.time_range || 'medium_term';

  if (!access_token) {
    return res.status(400).json({ error: 'Missing access_token parameter' });
  }

  console.log('Fetching top tracks with time range:', time_range);
  console.log('Access token:', access_token);

  const options = {
    url: 'https://api.spotify.com/v1/me/top/tracks',
    qs: {
      limit: 10,
      time_range: time_range,
      offset: 0
    },
    headers: { 
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    json: true
  };

  console.log('Request options:', JSON.stringify(options, null, 2));

  request.get(options, function(error, response, body) {
    if (error) {
      console.error('Request error:', error);
      return res.status(500).json({ error: 'Error fetching top tracks', details: error.message });
    }
    
    console.log('Response status:', response.statusCode);
    console.log('Response headers:', response.headers);
    console.log('Response body:', JSON.stringify(body, null, 2));

    if (response.statusCode !== 200) {
      console.error('Spotify API error:', {
        statusCode: response.statusCode,
        body: body,
        headers: response.headers
      });
      return res.status(response.statusCode).json({ 
        error: 'Spotify API error', 
        details: body,
        statusCode: response.statusCode
      });
    }

    console.log('Successfully fetched top tracks');
    res.json(body);
  });
});

app.listen(process.env.PORT || 5000);
