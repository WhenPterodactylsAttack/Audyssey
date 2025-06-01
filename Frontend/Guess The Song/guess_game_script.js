/** THIS IS PLACEHOLDER LOGIC @backend people */

document.addEventListener('DOMContentLoaded', function() {
    // Log the test data
    console.log('Test Songs Data:', testSongs);
    
    const playButton = document.getElementById('play-button');
    const timerDisplay = document.getElementById('timer');
    const guessForm = document.getElementById('guess-form');
    const nextSongBtn = document.getElementById('next-song');
    const feedbackContainer = document.getElementById('feedback-container');
    
    let timerInterval;
    let timeLeft = 10;
    let access_token = null;
    let player;
    let deviceId;
    let currentPlayTimer = null;
    let currentlyPlayingButton = null;
    let isPlayerReady = false;

    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        console.log(hashParams);
        return hashParams;
    }

    // Get access token when page loads
    const params = getHashParams();
    if (params.access_token) {
        access_token = params.access_token;
        console.log('Access token received:', access_token);
    } else {
        console.log('No access token found');
        // Optionally redirect to login
        // window.location.href = '/login';
    }
    
    // playing a song (simulation for now, need to integrate with Spotify API)
    playButton.addEventListener('click', function() {
        if (!access_token) {
            alert('Please log in first');
            window.location.href = '/login';
            return;
        }
        
        // Test with hardcoded URI
        const testUri = 'spotify:track:2dKkVF2m160z0RNDN2dddc';
        playSong(testUri, playButton);
        
        // Original UI behavior
        playButton.disabled = true;
        playButton.querySelector('i').classList.remove('fa-play');
        playButton.querySelector('i').classList.add('fa-pause');
        
        timeLeft = 10;
        timerDisplay.textContent = timeLeft;
        
        // music wave animation
        document.querySelector('.music-wave').classList.add('active');
        
        // countdown
        timerInterval = setInterval(function() {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timeUp();
            }
        }, 1000);
    });
    
    // Handle submit
    guessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearInterval(timerInterval);
        
        const songTitle = document.getElementById('song-title').value.trim();
        const songArtist = document.getElementById('song-artist').value.trim();
        
        // change logic to check against actual data from spotify
        let feedback = '';
        if (songTitle) {
            feedback = `
                <div class="feedback correct">
                    <h3>Correct!</h3>
                    <p>Song title: "Sample Song Title"</p>
                    <p>Artist: Sample Artist</p>
                    <p>+1 point for the song title</p>
                    ${songArtist ? '<p>+1 point for the artist</p>' : ''}
                </div>
            `;
            
            // update score
            const currentScore = parseInt(document.getElementById('current-score').textContent);
            document.getElementById('current-score').textContent = currentScore + (songArtist ? 2 : 1);
        }
        
        feedbackContainer.innerHTML = feedback;
        nextSongBtn.style.display = 'inline-block';
        document.querySelector('.music-wave').classList.remove('active');
        playButton.querySelector('i').classList.remove('fa-pause');
        playButton.querySelector('i').classList.add('fa-play');
    });
    
    nextSongBtn.addEventListener('click', function() {
        guessForm.reset();
        feedbackContainer.innerHTML = '';
        
        // Update round counter (TODO: change scoring scheme??)
        const currentRound = parseInt(document.getElementById('current-round').textContent);
        if (currentRound < 10) {
            document.getElementById('current-round').textContent = currentRound + 1;
        } else {
            document.getElementById('finish-modal').style.display = 'flex';
            document.getElementById('final-score').textContent = document.getElementById('current-score').textContent;

            document.getElementById('title-score').textContent = Math.floor(Math.random() * 11);
            document.getElementById('artist-score').textContent = Math.floor(Math.random() * 11);
        }
        
        playButton.disabled = false;
        nextSongBtn.style.display = 'none';
    });
    
    // Play again button (may need to change logic based on actual game flow and backend)
    document.getElementById('play-again').addEventListener('click', function() {
        document.getElementById('finish-modal').style.display = 'none';
        document.getElementById('current-round').textContent = '1';
        document.getElementById('current-score').textContent = '0';
        guessForm.reset();
        feedbackContainer.innerHTML = '';
    });
    
    // TODO: change song and artist to actual data from the backend
    function timeUp() {
        feedbackContainer.innerHTML = `
            <div class="feedback incorrect">
                <h3>Time's Up!</h3>
                <p>The correct answer was:</p>
                <p>Song title: "Sample Song Title"</p>
                <p>Artist: Sample Artist</p>
            </div>
        `;
        
        nextSongBtn.style.display = 'inline-block';
        document.querySelector('.music-wave').classList.remove('active');
        playButton.querySelector('i').classList.remove('fa-pause');
        playButton.querySelector('i').classList.add('fa-play');
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
        const params = getHashParams();
        const access_token = params.access_token;

        player = new Spotify.Player({
            name: 'Audyssey Web Player',
            getOAuthToken: cb => { cb(access_token); },
            volume: 0.5
        });

        // Error handling
        player.addListener('initialization_error', ({ message }) => { 
            console.error('Initialization error:', message);
            isPlayerReady = false;
        });
        player.addListener('authentication_error', ({ message }) => { 
            console.error('Authentication error:', message);
            isPlayerReady = false;
        });
        player.addListener('account_error', ({ message }) => { 
            console.error('Account error:', message);
            isPlayerReady = false;
        });
        player.addListener('playback_error', ({ message }) => { 
            console.error('Playback error:', message);
        });

        // Playback status updates
        player.addListener('player_state_changed', state => { 
            console.log('Player state changed:', state);
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            deviceId = device_id;
            isPlayerReady = true;
            // Activate this device
            activateDevice(device_id, access_token);
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
            isPlayerReady = false;
        });

        // Connect to the player!
        player.connect();
    };

    async function activateDevice(deviceId, access_token) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: false
                })
            });

            if (!response.ok) {
                throw new Error('Failed to activate device');
            }
            console.log('Device activated successfully');
        } catch (error) {
            console.error('Error activating device:', error);
        }
    }

    async function playSong(trackUri, button) {
        const params = getHashParams();
        const access_token = params.access_token;

        if (!isPlayerReady || !deviceId) {
            alert('Player not ready yet. Please wait a moment and try again.');
            return;
        }

        // If there's a currently playing song, stop it
        if (currentPlayTimer) {
            clearTimeout(currentPlayTimer);
            if (currentlyPlayingButton) {
                currentlyPlayingButton.disabled = false;
                currentlyPlayingButton.textContent = 'Play';
                currentlyPlayingButton.classList.remove('loading');
            }
        }

        // Show loading state
        button.disabled = true;
        button.textContent = 'Loading...';
        button.classList.add('loading');
        currentlyPlayingButton = button;

        try {
            console.log('Attempting to play track:', trackUri);
            console.log('Using device ID:', deviceId);
            
            // Call our backend endpoint with device ID
            const response = await fetch(`/play?access_token=${access_token}&trackUri=${encodeURIComponent(trackUri)}&device_id=${deviceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error response:', errorData);
                throw new Error(errorData.error || errorData.details || 'Failed to play track');
            }

            // Update button to show playing state
            button.textContent = 'Playing...';
            button.classList.remove('loading');

            // Set a timer to stop after 5 seconds
            currentPlayTimer = setTimeout(async () => {
                await player.pause();
                button.disabled = false;
                button.textContent = 'Play';
                button.classList.remove('loading');
                currentlyPlayingButton = null;
            }, 10000);

        } catch (error) {
            console.error('Error playing song:', error);
            button.disabled = false;
            button.textContent = 'Play';
            button.classList.remove('loading');
            currentlyPlayingButton = null;
            alert('Error playing song: ' + (error.message || 'Unknown error'));
        }
    }




});