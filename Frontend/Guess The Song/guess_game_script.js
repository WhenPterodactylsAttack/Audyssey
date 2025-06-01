/** THIS IS PLACEHOLDER LOGIC @backend people */

document.addEventListener('DOMContentLoaded', function() {
    // Log the test data
    console.log('Test Songs Data:', testSongs);
    
    const playButton = document.getElementById('play-button');
    const timerDisplay = document.getElementById('timer');
    const guessForm = document.getElementById('guess-form');
    const nextSongBtn = document.getElementById('next-song');
    const feedbackContainer = document.getElementById('feedback-container');
    const musicWave = document.querySelector('.music-wave');
    
    let timerInterval;
    let timeLeft = 10;
    let access_token = null;
    let player;
    let deviceId;
    let currentPlayTimer = null;
    let currentlyPlayingButton = null;
    let isPlayerReady = false;
    let currentSongIndex = 0; // Track current song index

    // Function to get current song
    function getCurrentSong() {
        return testSongs[currentSongIndex];
    }

    // Function to move to next song
    function moveToNextSong() {
        currentSongIndex = (currentSongIndex + 1) % testSongs.length;
        return getCurrentSong();
    }

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
    
    // Function to update play button state
    function updatePlayButtonState(isPlaying) {
        if (playButton) {
            playButton.disabled = isPlaying;
            const icon = playButton.querySelector('i');
            if (icon) {
                icon.classList.remove(isPlaying ? 'fa-play' : 'fa-pause');
                icon.classList.add(isPlaying ? 'fa-pause' : 'fa-play');
            }
            // Clear any text content
            playButton.textContent = '';
            // Re-add the icon
            const newIcon = document.createElement('i');
            newIcon.className = `fas ${isPlaying ? 'fa-pause' : 'fa-play'}`;
            playButton.appendChild(newIcon);
        }
    }

    // Function to update music wave state
    function updateMusicWaveState(isActive) {
        if (musicWave) {
            if (isActive) {
                musicWave.classList.add('active');
            } else {
                musicWave.classList.remove('active');
            }
        }
    }

    // Function to reset timer
    function resetTimer() {
        clearInterval(timerInterval);
        timeLeft = 10;
        timerDisplay.textContent = timeLeft;
    }

    // playing a song (simulation for now, need to integrate with Spotify API)
    playButton.addEventListener('click', async function() {
        if (!access_token) {
            alert('Please log in first');
            window.location.href = '/login';
            return;
        }
        
        const currentSong = getCurrentSong();
        const testUri = currentSong.track.uri;
        
        // Reset timer and UI state
        resetTimer();
        updatePlayButtonState(true);
        
        try {
            // Start playing the song
            await playSong(testUri, playButton);
            
            // music wave animation
            updateMusicWaveState(true);
            
            // Start countdown after a short delay to ensure music has started
            setTimeout(() => {
                // countdown
                timerInterval = setInterval(function() {
                    timeLeft--;
                    timerDisplay.textContent = timeLeft;
                    
                    if (timeLeft <= 0) {
                        clearInterval(timerInterval);
                        timeUp();
                    }
                }, 1000);
            }, 500); // Small delay to ensure music has started
        } catch (error) {
            // If song fails to play, reset UI
            updatePlayButtonState(false);
            alert('Error playing song: ' + error.message);
        }
    });
    
    // Handle submit
    guessForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearInterval(timerInterval);
        
        const songTitle = document.getElementById('song-title').value.trim().toLowerCase();
        const songArtist = document.getElementById('song-artist').value.trim().toLowerCase();
        const currentSong = getCurrentSong();
        
        // Get correct answers
        const correctTitle = currentSong.track.name.toLowerCase();
        const correctArtist = currentSong.track.artists[0].name.toLowerCase();
        
        // Check answers
        const titleCorrect = songTitle === correctTitle;
        const artistCorrect = songArtist === correctArtist;
        
        let feedback = '';
        let pointsEarned = 0;
        
        if (titleCorrect || artistCorrect) {
            // Build feedback message
            feedback = `
                <div class="feedback ${titleCorrect && artistCorrect ? 'correct' : 'partial'}">
                    <h3>${titleCorrect && artistCorrect ? 'Correct!' : 'Partially Correct!'}</h3>
                    <p>Song title: "${currentSong.track.name}"</p>
                    <p>Artist: ${currentSong.track.artists[0].name}</p>
            `;
            
            // Add points feedback
            if (titleCorrect) {
                pointsEarned += 1;
                feedback += '<p>+1 point for the song title</p>';
            }
            if (artistCorrect) {
                pointsEarned += 1;
                feedback += '<p>+1 point for the artist</p>';
            }
            
            feedback += '</div>';
        } else {
            feedback = `
                <div class="feedback incorrect">
                    <h3>Incorrect!</h3>
                    <p>The correct answer was:</p>
                    <p>Song title: "${currentSong.track.name}"</p>
                    <p>Artist: ${currentSong.track.artists[0].name}</p>
                </div>
            `;
        }
        
        // Update score
        const currentScore = parseInt(document.getElementById('current-score').textContent);
        document.getElementById('current-score').textContent = currentScore + pointsEarned;
        
        feedbackContainer.innerHTML = feedback;
        nextSongBtn.style.display = 'inline-block';
        updateMusicWaveState(false);
        updatePlayButtonState(false);
    });
    
    nextSongBtn.addEventListener('click', function() {
        guessForm.reset();
        feedbackContainer.innerHTML = '';
        
        // Move to next song
        moveToNextSong();
        
        // Update round counter
        const currentRound = parseInt(document.getElementById('current-round').textContent);
        if (currentRound < 10) {
            document.getElementById('current-round').textContent = currentRound + 1;
        } else {
            document.getElementById('finish-modal').style.display = 'flex';
            document.getElementById('final-score').textContent = document.getElementById('current-score').textContent;

            document.getElementById('title-score').textContent = Math.floor(Math.random() * 11);
            document.getElementById('artist-score').textContent = Math.floor(Math.random() * 11);
        }
        
        // Reset timer and UI state
        resetTimer();
        updatePlayButtonState(false);
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
    
    function timeUp() {
        const currentSong = getCurrentSong();
        feedbackContainer.innerHTML = `
            <div class="feedback incorrect">
                <h3>Time's Up!</h3>
                <p>The correct answer was:</p>
                <p>Song title: "${currentSong.track.name}"</p>
                <p>Artist: ${currentSong.track.artists[0].name}</p>
            </div>
        `;
        
        nextSongBtn.style.display = 'inline-block';
        updateMusicWaveState(false);
        updatePlayButtonState(false);
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

            // Set a timer to stop after 10 seconds
            currentPlayTimer = setTimeout(async () => {
                await player.pause();
                button.disabled = false;
                button.textContent = 'Play';
                button.classList.remove('loading');
                currentlyPlayingButton = null;
                
                // Stop the countdown and show time up
                clearInterval(timerInterval);
                timeLeft = 0;
                timerDisplay.textContent = timeLeft;
                timeUp();
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