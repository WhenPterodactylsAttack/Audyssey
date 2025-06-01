/** THIS IS PLACEHOLDER LOGIC @backend people */

document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById('play-button');
    const timerDisplay = document.getElementById('timer');
    const guessForm = document.getElementById('guess-form');
    const nextSongBtn = document.getElementById('next-song');
    const feedbackContainer = document.getElementById('feedback-container');
    
    let timerInterval;
    let timeLeft = 10;
    let access_token = null;

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
        loadTopTracks('medium_term');
        
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



    function loadTopTracks(timeRange) {
        const params = getHashParams();
        const access_token = params.access_token;

        if (!access_token) {
            fetch('/')
                .then(response => response.text())
                .then(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    const tokenElement = tempDiv.querySelector('.text-overflow');
                    if (tokenElement) {
                        window.location.href = `search.html#access_token=${tokenElement.textContent}`;
                    } else {
                        window.location.href = '/';
                    }
                })
                .catch(() => {
                    window.location.href = '/';
                });
        } else {
            console.log('Fetching top tracks with token:', access_token);
            fetch(`/top-tracks?access_token=${access_token}`)
            .then(response => {
                console.log('Response status:', response.status);
                return response.json().then(data => {
                    if (!response.ok) {
                        console.error('Server response:', data);
                        throw new Error(data.error?.details?.message || data.error || 'Failed to fetch top tracks');
                    }
                    return data;
                });
            })
            .then(data => {
                console.log('Top tracks data:', data);
                if (data.items) {
                    console.log(data.items);
                } else {
                    throw new Error('No tracks found in response');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }

});