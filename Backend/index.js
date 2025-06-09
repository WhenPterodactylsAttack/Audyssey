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
const path = require('path');

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

// Serve static files from Frontend directory and all its subdirectories
app.use(express.static(path.join(__dirname, '..', 'Frontend'), {
    dotfiles: 'allow',
    setHeaders: (res, path, stat) => {
        // Set proper MIME types for different file types
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript; charset=UTF-8');
        } else if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css; charset=UTF-8');
        } else if (path.endsWith('.html')) {
            res.set('Content-Type', 'text/html; charset=UTF-8');
        }
        // Add CORS headers
        res.set('Access-Control-Allow-Origin', '*');
    }
}))
.use(cors())
.use(cookieParser());

// Add specific routes for game pages
app.get('/guess-game-intro', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'Guess The Song', 'guess_game_intro.html'));
});

app.get('/guess-game-round', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'Guess The Song', 'guess_game_round.html'));
});

// Add routes for Finish the Lyrics game
app.get('/finish-lyrics-intro', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'Finish the Lyrics', 'finish_the_lyrics_intro.html'));
});

app.get('/finish-lyrics-round', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'Finish the Lyrics', 'finish_the_lyrics_round.html'));
});

// Add routes for Jeopardy game
app.get('/jeopardy-intro', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'Jeopardy', 'jeopardy_intro.html'));
});

app.get('/jeopardy-round', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'Frontend', 'Jeopardy', 'jeopardy_round.html'));
});

// Add a catch-all route for any other HTML files
app.get('*.html', function(req, res, next) {
    const filePath = path.join(__dirname, '..', 'Frontend', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            next(err);
        }
    });
});

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email user-top-read user-library-read user-modify-playback-state user-read-playback-state streaming';
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

app.put('/play', function(req, res) {
  const access_token = req.query.access_token;
  const trackUri = req.query.trackUri;
  const device_id = req.query.device_id;

  console.log('Play request received:', {
    trackUri,
    device_id,
    hasAccessToken: !!access_token
  });

  if (!access_token || !trackUri || !device_id) {
    console.error('Missing required parameters:', {
      hasAccessToken: !!access_token,
      hasTrackUri: !!trackUri,
      hasDeviceId: !!device_id
    });
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: {
        access_token: !access_token,
        trackUri: !trackUri,
        device_id: !device_id
      }
    });
  }

  // First, transfer playback to our device
  const transferOptions = {
    url: 'https://api.spotify.com/v1/me/player',
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: {
      device_ids: [device_id],
      play: false
    },
    json: true
  };

  console.log('Transferring playback to device:', device_id);

  request.put(transferOptions, function(error, response, body) {
    if (error) {
      console.error("Error transferring playback:", error);
      return res.status(500).json({ error: 'Error transferring playback', details: error.message });
    }

    if (response.statusCode !== 204) {
      console.error("Transfer playback failed:", {
        statusCode: response.statusCode,
        body: body
      });
      return res.status(response.statusCode).json({ 
        error: 'Error transferring playback', 
        details: body 
      });
    }

    console.log('Successfully transferred playback');

    // Then start playback
    const playOptions = {
      url: `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: {
        uris: [trackUri]
      },
      json: true
    };

    console.log('Starting playback of track:', trackUri);

    request.put(playOptions, function(error, response, body) {
      if (error) {
        console.error("Error playing track:", error);
        return res.status(500).json({ error: 'Error playing track', details: error.message });
      }

      if (response.statusCode !== 204) {
        console.error("Play track failed:", {
          statusCode: response.statusCode,
          body: body
        });
        return res.status(response.statusCode).json({ 
          error: 'Error playing track', 
          details: body 
        });
      }

      console.log('Successfully started playback');
      res.status(204).send();
    });
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

// Add this at the end of the file
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(process.env.PORT || 5000, () => {
    console.log('Server running on port', process.env.PORT || 5000);
  });
}
