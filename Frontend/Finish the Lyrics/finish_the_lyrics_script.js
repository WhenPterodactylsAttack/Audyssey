// lyrics data, {} indicate missing word
const lyricsData = [
    {
        songTitle: "Shape of You",
        artist: "Ed Sheeran",
        lyrics: "I'm in love with the shape of {you}",
        answer: "you"
    },
    {
        songTitle: "Bohemian Rhapsody",
        artist: "Queen",
        lyrics: "Is this the real {life}? Is this just fantasy?",
        answer: "life"
    },
    {
        songTitle: "Rolling in the Deep",
        artist: "Adele",
        lyrics: "We could have had it {all}",
        answer: "all"
    },
    {
        songTitle: "Bad Guy",
        artist: "Billie Eilish",
        lyrics: "So you're a tough {guy}",
        answer: "guy"
    },
    {
        songTitle: "Blinding Lights",
        artist: "The Weeknd",
        lyrics: "I said, ooh, I'm blinded by the {lights}",
        answer: "lights"
    }
];

// game vars
let currentRound = 0;
let score = 0;
let timerInterval;
let timeLeft = 10;

// we can change this, other game has 10, maybe option to change num rounds?
const totalRounds = 5;

// init game
function startGame() {
    currentRound = 0;
    score = 0;
    document.getElementById('current-score').textContent = '0';
    document.getElementById('current-round').textContent = '1';
    
    // Load first lyric
    showRound();
}

// Display the current round
function showRound() {
    // Check if we've reached the end of the game
    if (currentRound >= totalRounds) {
        endGame();
        return;
    }
    
    const round = lyricsData[currentRound];
    
    // song info
    document.getElementById('song-title').textContent = round.songTitle;
    document.getElementById('song-artist').textContent = round.artist;
    const formattedLyrics = formatLyrics(round.lyrics);
    document.getElementById('lyrics-display').innerHTML = formattedLyrics;
    
    // user input field
    const guessInput = document.getElementById('lyrics-guess');
    guessInput.value = '';
    guessInput.focus();
    
    // feedback container
    document.getElementById('feedback-container').innerHTML = '';
    
    // prep for round (clear states, reset timer)
    document.getElementById('next-lyric').style.display = 'none';
    timeLeft = 10;
    document.getElementById('timer').textContent = timeLeft;
    
    // timer start
    startTimer();
}


// our input has a bracketed word that we want to replace with a blank placeholder, which is styled here
// ____ is the placeholder for the missing word
function formatLyrics(lyrics) {
    const formattedLyrics = lyrics.replace(/\{([^}]+)\}/, '<span class="lyrics-blank">_____</span>');
    return `<p class="lyrics-text"><span class="lyrics-line">${formattedLyrics}</span></p>`;
}

function startTimer() {
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById('timer');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        // add animation classes as time runs out (we can change in animations.scss)
        if (timeLeft <= 3) {
            timerDisplay.classList.add('pulse');
        } else {
            timerDisplay.classList.remove('pulse');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timeUp();
        }
    }, 1000);
}

function timeUp() {
    const currentLyric = lyricsData[currentRound];
    document.getElementById('feedback-container').innerHTML = `
        <div class="feedback incorrect">
            <h3>Time's Up!</h3>
            <p>The correct answer was: "${currentLyric.answer}"</p>
        </div>
    `;
    
    // show the answer in the lyrics once round is finished
    const blankElement = document.querySelector('.lyrics-blank');
    if (blankElement) {
        blankElement.textContent = currentLyric.answer;
        blankElement.classList.add('show-answer');
    }
    
    document.getElementById('next-lyric').style.display = 'inline-block';
}

// check the user's answer
function checkAnswer() {
    clearInterval(timerInterval);
    
    const userGuess = document.getElementById('lyrics-guess').value.trim().toLowerCase();
    const currentLyric = lyricsData[currentRound];
    const correctAnswer = currentLyric.answer.toLowerCase();
    
    if (userGuess === correctAnswer) { // we can do some case checking or space trimming here, but for now its simple equivalence
        score++;
        document.getElementById('current-score').textContent = score;
        
        document.getElementById('feedback-container').innerHTML = `
            <div class="feedback correct">
                <h3>Correct!</h3>
                <p>You completed the lyric correctly!</p>
                <p>+1 point</p>
            </div>
        `;
        
        const blankElement = document.querySelector('.lyrics-blank');
        if (blankElement) {
            blankElement.textContent = currentLyric.answer;
            blankElement.classList.add('correct-answer');
        }
    } else {
        // qrong ans
        document.getElementById('feedback-container').innerHTML = `
            <div class="feedback incorrect">
                <h3>Not Quite!</h3>
                <p>The correct answer was: "${currentLyric.answer}"</p>
            </div>
        `;
        
        // correct answer in the lyrics
        const blankElement = document.querySelector('.lyrics-blank');
        if (blankElement) {
            blankElement.textContent = currentLyric.answer;
            blankElement.classList.add('show-answer');
        }
    }
    
    document.getElementById('next-lyric').style.display = 'inline-block';
}

// show results
function endGame() {
    document.getElementById('finish-modal').style.display = 'flex';
    document.getElementById('final-score').textContent = score;
    document.getElementById('correct-count').textContent = score;
}

// random order for now, but using API, we can get random songs in some genre instead
// probably will delete in the future
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document.addEventListener('DOMContentLoaded', () => {
    shuffleArray(lyricsData);
    
    const guessForm = document.getElementById('guess-form');
    if (guessForm) {
        guessForm.addEventListener('submit', function (e) {
            e.preventDefault();
            checkAnswer();
        });
    }
    
    const nextLyricBtn = document.getElementById('next-lyric');
    if (nextLyricBtn) {
        nextLyricBtn.addEventListener('click', function() {
            currentRound++;
            document.getElementById('current-round').textContent = currentRound + 1;
            showRound();
        });
    }
    
    const playAgainBtn = document.getElementById('play-again');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            document.getElementById('finish-modal').style.display = 'none';
            // Shuffle lyrics again for a new game
            shuffleArray(lyricsData);
            startGame();
        });
    }
    
    if (document.getElementById('lyrics-display')) {
        startGame();
    }
});


// Load user info from localStorage and set the account image
document.addEventListener("DOMContentLoaded", function() {
    let userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo && userInfo.picture) {
        document.getElementById("account-image").src = userInfo.picture;
    }
});