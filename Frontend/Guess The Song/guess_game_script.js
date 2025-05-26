/** THIS IS PLACEHOLDER LOGIC @backend people */

document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.getElementById('play-button');
    const timerDisplay = document.getElementById('timer');
    const guessForm = document.getElementById('guess-form');
    const nextSongBtn = document.getElementById('next-song');
    const feedbackContainer = document.getElementById('feedback-container');
    
    let timerInterval;
    let timeLeft = 10;
    
    // playing a song (simulation for now, need to integrate with Spotify API)
    playButton.addEventListener('click', function() {
        playButton.disabled = true; // can change to pause or something?
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
});