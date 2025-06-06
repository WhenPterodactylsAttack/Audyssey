/** THIS IS PLACEHOLDER LOGIC @backend people */

(function () {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    const display_name = hashParams.get("display_name");
    const email = hashParams.get("email");
    const picture = hashParams.get("picture");
    const spotify_id = hashParams.get("spotify_id");

    if (access_token && spotify_id) {
        const userInfo = {
            access_token,
            refresh_token,
            display_name,
            email,
            picture,
            spotify_id,
            _id: spotify_id // to match the backend's expected field
        };

        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        console.log("✅ User info saved to localStorage:", userInfo);

        // Remove hash from URL to clean things up
        window.history.replaceState(null, null, window.location.pathname);
    }
})();


document.addEventListener('DOMContentLoaded', function() {
    // Add song start time tracking
    let songStartTime = 0;
    const MAX_POINTS_PER_SONG = 100;
    const MAX_TIME_FOR_POINTS = 120;    
    
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
    let currentSongIndex = 0; 
    let totalTime = 120; // 2 minutes for the entire game

    let timerStarted = false; 
    let playedSongs = []; 
    
    // Pick a random song to start with instead of always starting with the first one
    // Initialize with a random song instead of always starting with index 0
    currentSongIndex = Math.floor(Math.random() * testSongs.length);
    console.log('Starting with random song:', testSongs[currentSongIndex].track.name);
    
    // Function to get current song
    function getCurrentSong() {
        return testSongs[currentSongIndex];
    }

    
    function moveToNextSong() {
        
        if (!playedSongs.includes(currentSongIndex)) {
            playedSongs.push(currentSongIndex);
        }
        
        if (playedSongs.length >= testSongs.length) {
            console.log('All songs have been played. Resetting played songs list.');
            playedSongs = [];
        }
        
        const availableSongs = testSongs.map((_, index) => index)
            .filter(index => !playedSongs.includes(index));
        
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        currentSongIndex = availableSongs[randomIndex];
        
        const nextSong = getCurrentSong();
        console.log('Selected random song:', nextSong.track.name);
        
        return nextSong;
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
        
        // Start the timer the first time a song is played
        if (!timerStarted) {
            startGameTimer();
            timerStarted = true;
        }
        
        updatePlayButtonState(true);
        
        try {

            await playSong(testUri, playButton);
            
            updateMusicWaveState(true);
        } catch (error) {

            updatePlayButtonState(false);
            alert('Error playing song: ' + error.message);
        }
    });
    
    // Handle submit
    guessForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const songTitle = document.getElementById('song-title').value.trim().toLowerCase();
        const songArtist = document.getElementById('song-artist').value.trim().toLowerCase();
        const currentSong = getCurrentSong();

 
        const correctTitle = currentSong.track.name.toLowerCase();
        const correctArtist = currentSong.track.artists[0].name.toLowerCase();

        // Check answers
        const titleCorrect = songTitle === correctTitle;
        const artistCorrect = songArtist === correctArtist;

        // Calculate time-based points
        const timeElapsed = (Date.now() - songStartTime) / 1000;
        let pointsPerCorrectAnswer = Math.max(0, Math.floor(MAX_POINTS_PER_SONG - (timeElapsed / MAX_TIME_FOR_POINTS) * MAX_POINTS_PER_SONG));
        
        console.log(`Time elapsed: ${timeElapsed.toFixed(2)}s, Points per correct answer: ${pointsPerCorrectAnswer}`);

        let feedback = '';
        let pointsEarned = 0;

        if (titleCorrect || artistCorrect) {
            feedback = `
                <div class="feedback ${titleCorrect && artistCorrect ? 'correct' : 'partial'}">
                    <h3>${titleCorrect && artistCorrect ? 'Correct!' : 'Partially Correct!'}</h3>
                    <p>Song title: "${currentSong.track.name}"</p>
                    <p>Artist: ${currentSong.track.artists[0].name}</p>
            `;

            if (titleCorrect) {
                pointsEarned += pointsPerCorrectAnswer;
                feedback += `<p>+${pointsPerCorrectAnswer} points for the song title</p>`;
                showPointIndicator(pointsPerCorrectAnswer);
            }
            if (artistCorrect) {
                pointsEarned += pointsPerCorrectAnswer;
                feedback += `<p>+${pointsPerCorrectAnswer} points for the artist</p>`;
                showPointIndicator(pointsPerCorrectAnswer);
            }

            feedback += '</div>';
        } else {
            // Both title and artist are wrong - deduct 50 points
            const penaltyPoints = 50;
            const currentScore = parseInt(document.getElementById('current-score').textContent);
            const newScore = Math.max(0, currentScore - penaltyPoints); // Don't go below zero
            
            document.getElementById('current-score').textContent = newScore;
            showNegativePointIndicator(penaltyPoints); // Show penalty points
            
            feedback = `
                <div class="feedback incorrect">
                    <h3>Incorrect!</h3>
                    <p>The correct answer was:</p>
                    <p>Song title: "${currentSong.track.name}"</p>
                    <p>Artist: ${currentSong.track.artists[0].name}</p>
                    <p class="penalty">-${penaltyPoints} points penalty</p>
                </div>
            `;
            
            // Calculate points earned (-50 for wrong guess)
            pointsEarned = -penaltyPoints;
        }

        // Update score only if points were earned (not already handled in the else block)
        if (pointsEarned > 0) {
            const currentScore = parseInt(document.getElementById('current-score').textContent);
            document.getElementById('current-score').textContent = currentScore + pointsEarned;
        }

        feedbackContainer.innerHTML = feedback;

        // Move to the next song
        const nextSong = moveToNextSong();

        // Reset the form for the next song
        guessForm.reset();
        setTimeout(() => {
            feedbackContainer.innerHTML = '';
        }, 2000);

        // Start playing the next song
        const playButton = document.getElementById('play-button');
        await playSong(nextSong.track.uri, playButton);
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
    document.getElementById('play-again').addEventListener('click', async function() {
        document.getElementById('finish-modal').style.display = 'none';
        document.getElementById('current-round').textContent = '1';
        document.getElementById('current-score').textContent = '0';
        guessForm.reset();
        feedbackContainer.innerHTML = '';

        document.getElementById('song-title').disabled = false;
        document.getElementById('song-artist').disabled = false;
        document.getElementById('submit-button').disabled = false;
        document.getElementById('skip-button').disabled = false;
        document.getElementById('play-button').disabled = false;

        // Reset visual classes on timer
        const leftTimerElement = document.getElementById('left-timer');
        leftTimerElement.classList.remove('timer-warning', 'timer-danger', 'timer-finished');

        // Reset state variables
        playedSongs = [];
        timerStarted = false;
        clearInterval(timerInterval);
        totalTime = 120;

        // Pick a new random starting song
        currentSongIndex = Math.floor(Math.random() * testSongs.length);
        const newSong = getCurrentSong();
        console.log('Restarting with song:', newSong.track.name);

        // Restart timer
        startGameTimer();

        // Auto-start first song again (optional)
        await playSong(newSong.track.uri, playButton);
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
            
            // Record the time when song starts playing
            songStartTime = Date.now();
            console.log("Song started at: ", songStartTime);

        } catch (error) {
            console.error('Error in playSong:', error);
            button.disabled = false;
            button.textContent = 'Play';
            button.classList.remove('loading');
            currentlyPlayingButton = null;
        }
    }

    // Updated point indicator function with random positioning
    function showPointIndicator(points) {
        console.log("Showing point indicator: +" + points);
        
        const pointIndicator = document.createElement('div');
        pointIndicator.className = 'point-indicator';
        pointIndicator.textContent = `+${points}`;
        
        // Style the indicator directly
        pointIndicator.style.position = 'fixed';
        pointIndicator.style.fontSize = '96px';
        pointIndicator.style.fontWeight = 'bold';
        pointIndicator.style.color = '#4caf50';
        pointIndicator.style.zIndex = '9999';
        pointIndicator.style.pointerEvents = 'none';
        pointIndicator.style.textShadow = '3px 3px 6px rgba(0,0,0,0.7)';
        
        // Random positioning on the right side
        const rightDistance = Math.floor(Math.random() * 100) + 20; // 20px to 120px from right
        const verticalPosition = Math.floor(Math.random() * 60) + 20; // 20% to 80% from top
        
        pointIndicator.style.right = `${rightDistance}px`;
        pointIndicator.style.top = `${verticalPosition}%`;
        // Remove the transform since we're using percentage positioning
        
        pointIndicator.style.filter = 'drop-shadow(0 0 10px rgba(76, 175, 80, 0.7))';
        
        document.body.appendChild(pointIndicator);
        
        pointIndicator.style.animation = 'fadeOut 2s ease-out forwards';
        
        setTimeout(() => {
            pointIndicator.remove();
        }, 2000);
    }

    // Skip button functionality
    const skipButton = document.getElementById('skip-button');

    skipButton.addEventListener('click', async function() {
        // Deduct points for skipping
        const skipPenalty = 30;
        const currentScore = parseInt(document.getElementById('current-score').textContent);
        

        const newScore = Math.max(0, currentScore - skipPenalty);
        document.getElementById('current-score').textContent = newScore;
        
        // Show negative points indicator
        showNegativePointIndicator(skipPenalty);
        
        // Show feedback
        feedbackContainer.innerHTML = `
            <div class="feedback skipped">
                <h3>Song Skipped</h3>
                <p>The song was: "${getCurrentSong().track.name}" by ${getCurrentSong().track.artists[0].name}</p>
                <p>-${skipPenalty} points penalty</p>
            </div>
        `;

        const nextSong = moveToNextSong();
        

        guessForm.reset();
        setTimeout(() => {
            feedbackContainer.innerHTML = '';
        }, 2000);
        
        // Start playing the next song
        await playSong(nextSong.track.uri, playButton);
    });


    function showNegativePointIndicator(points) {
        console.log("Showing negative point indicator: -" + points);
        
        const pointIndicator = document.createElement('div');
        pointIndicator.className = 'point-indicator negative';
        pointIndicator.textContent = `-${points}`;
        

        pointIndicator.style.position = 'fixed';
        pointIndicator.style.fontSize = '96px';
        pointIndicator.style.fontWeight = 'bold';
        pointIndicator.style.color = '#ff5252';
        pointIndicator.style.zIndex = '9999';
        pointIndicator.style.pointerEvents = 'none';
        pointIndicator.style.textShadow = '3px 3px 6px rgba(0,0,0,0.7)';
        

        const rightDistance = Math.floor(Math.random() * 100) + 20;
        const verticalPosition = Math.floor(Math.random() * 60) + 20;
        
        pointIndicator.style.right = `${rightDistance}px`;
        pointIndicator.style.top = `${verticalPosition}%`;
        
        pointIndicator.style.filter = 'drop-shadow(0 0 10px rgba(255, 82, 82, 0.7))';
        
        document.body.appendChild(pointIndicator);
        
        pointIndicator.style.animation = 'fadeOut 2s ease-out forwards';
        
        setTimeout(() => {
            pointIndicator.remove();
        }, 2000);
    }


    function startGameTimer() {
        const leftTimerElement = document.getElementById('left-timer');
        let totalTimeSeconds = 120; // 2 minutes
        
        updateTimerDisplay(totalTimeSeconds);
        
        // Start the countdown
        timerInterval = setInterval(function() {
            totalTimeSeconds--;
            updateTimerDisplay(totalTimeSeconds);
            
            // Add warning classes for time states
            if (totalTimeSeconds <= 30 && totalTimeSeconds > 10) {
                leftTimerElement.classList.add('timer-warning');
            } else if (totalTimeSeconds <= 10) {
                leftTimerElement.classList.remove('timer-warning');
                leftTimerElement.classList.add('timer-danger');
            }
            
            // Handle time's up
            if (totalTimeSeconds <= 0) {
                clearInterval(timerInterval);
                leftTimerElement.classList.add('timer-finished');
                gameOver();
            }
        }, 1000);
    }


    function updateTimerDisplay(totalSeconds) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        document.getElementById('left-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }


    function gameOver() {

        if (player) {
            player.pause().then(() => {
                console.log('Playback stopped due to game ending');
            }).catch(error => {
                console.error('Error stopping playback:', error);
            });
        }
        

        if (currentlyPlayingButton) {
            currentlyPlayingButton.disabled = true;
            currentlyPlayingButton.textContent = 'Play';
            currentlyPlayingButton.classList.remove('loading');
        }
        
        // Stop music wave animation
        const musicWave = document.querySelector('.music-wave');
        if (musicWave) {
            musicWave.classList.remove('active');
        }
        
        document.getElementById('song-title').disabled = true;
        document.getElementById('song-artist').disabled = true;
        document.getElementById('submit-button').disabled = true;
        document.getElementById('skip-button').disabled = true;
        document.getElementById('play-button').disabled = true;
        
        // Show game over message
        feedbackContainer.innerHTML = `
            <div class="feedback game-over">
                <h3>Game Over!</h3>
                <p>Time's up! You've earned ${document.getElementById('current-score').textContent} points.</p>
            </div>
        `;
        
        // Show finish modal with final score
        document.getElementById('finish-modal').style.display = 'flex';
        document.getElementById('final-score').textContent = document.getElementById('current-score').textContent;

        //convert final-score to an integer
        let final_score = document.getElementById('final-score').textContent;
        let final_score_int = parseInt(final_score);

        let userInfo = JSON.parse(localStorage.getItem("userInfo"));
        console.log("This is userinfo:", userInfo);

    if (userInfo && userInfo.id) {
        fetch('http://localhost:5001/api/update-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userInfo.id,
                userEmail: userInfo.email,
                guess_game_score: final_score_int
            }),

        })
        .then(res => res.json())
        .then(data => {
            console.log('Score update response:', data);
        })
        .catch(err => {
            console.error('Error updating score:', err);
        });
    }


    }

    // Add CSS for game-over feedback
});

