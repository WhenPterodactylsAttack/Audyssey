# Spotify Authentication in Node

Node.js web app with Spotify Authorization Code authentication flow, bootstrapped from [this repo](https://github.com/spotify/web-api-auth-examples).

Here are steps for running a Spotify web app locally starting from this repo (requires [Node.js](https://nodejs.org/en/)):

## Setting up local Node.js environment:
```
git clone https://github.com/tommygeiger/node-spotify-auth
cd spotify-webapi
npm install
npm start
```
Your app should be up and running at localhost:5000 (but it's not going to work yet)

## Setting up a Spotify web app:

You'll need to register a Spotify app and add your own credentials to the code. First go to the [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard) and create an application. Then add these two redirect URIs in settings:
```
http://localhost:5000
http://localhost:5000/callback
```
Now replace `process.env.CLIENT_ID` and `process.env.CLIENT_SECRET` in `index.js` with your application's client ID and client secret from your Spotify dashboard. Finally, replace `process.env.REDIRECT_URI` with `http://localhost:5000/callback`.
