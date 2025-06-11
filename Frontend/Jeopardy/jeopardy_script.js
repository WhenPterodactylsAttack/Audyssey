/** THIS IS PLACEHOLDER LOGIC - Backend integration will be implemented later */

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
    let currentScore = 0;
    let questionsRemaining = 25;
    let timerInterval;
    let timeLeft = 10;
    
    const jeopardyGrid = document.getElementById('jeopardy-grid');
    const currentScoreDisplay = document.getElementById('current-score');
    const questionsRemainingDisplay = document.getElementById('questions-remaining');

    const questionModal = document.getElementById('question-modal');
    const feedbackModal = document.getElementById('feedback-modal');
    const gameOverModal = document.getElementById('game-over-modal');

    const modalCategory = document.getElementById('modal-category');
    const modalValue = document.getElementById('modal-value');

    const questionText = document.getElementById('question-text');

    const timerBar = document.getElementById('timer-bar');
    const timerCount = document.getElementById('timer-count');

    const answerForm = document.getElementById('answer-form');
    const answerInput = document.getElementById('answer-input');
    const feedbackContainer = document.getElementById('feedback-container');

    const continueBtn = document.getElementById('continue-btn');
    const playAgainBtn = document.getElementById('play-again');
    const finalScoreDisplay = document.getElementById('final-score');

    const performanceMessage = document.getElementById('performance-message');
    
    // placeholder data (TODO: replace with stuff from Spotify API or other info source)
    // generated using chatgpt
    const gameData = {
        categories: [
            {
                name: "2010s Hits",
                clues: [
                    { value: 100, clue: "This 2012 hit by PSY became the first YouTube video to reach 1 billion views", answer: "what is gangnam style" },
                    { value: 200, clue: "This artist's 2011 album '21' featured the hit songs 'Rolling in the Deep' and 'Someone Like You'", answer: "who is adele" },
                    { value: 300, clue: "This 2013 song by Robin Thicke featured Pharrell and became controversial for its lyrics and video", answer: "what is blurred lines" },
                    { value: 400, clue: "This artist had a 2019 hit with 'Bad Guy' and became the youngest person to win the four main Grammy categories", answer: "who is billie eilish" },
                    { value: 500, clue: "This 2017 Latin pop song became the most-streamed song of all time on Spotify", answer: "what is despacito" }
                ]
            },
            {
                name: "Rock Legends",
                clues: [
                    { value: 100, clue: "This band's 'Bohemian Rhapsody' was featured in the movie 'Wayne's World'", answer: "who is queen" },
                    { value: 200, clue: "This artist known as 'The Boss' is famous for albums like 'Born to Run' and 'Born in the U.S.A.'", answer: "who is bruce springsteen" },
                    { value: 300, clue: "This band formed in 1965 featured Mick Jagger and Keith Richards", answer: "who are the rolling stones" },
                    { value: 400, clue: "This band's album 'The Dark Side of the Moon' spent a record 950 weeks on the Billboard charts", answer: "who is pink floyd" },
                    { value: 500, clue: "This Seattle-based band led by Kurt Cobain released the album 'Nevermind'", answer: "who is nirvana" }
                ]
            },
            {
                name: "Spotify Hits",
                clues: [
                    { value: 100, clue: "This song by Ed Sheeran became the most-streamed song on Spotify in 2017", answer: "what is shape of you" },
                    { value: 200, clue: "This 2015 song by Justin Bieber became a global hit and stayed on the charts for over a year", answer: "what is sorry" },
                    { value: 300, clue: "This 2020 hit by The Weeknd was the first song to hit 1 billion streams on Spotify in a single year", answer: "what is blinding lights" },
                    { value: 400, clue: "This song by Drake holds the record for most streams in a single day on Spotify, with over 10 million streams", answer: "what is god's plan" },
                    { value: 500, clue: "This 2019 song by Lil Nas X, featuring Billy Ray Cyrus, broke numerous streaming records and topped charts for months", answer: "what is old town road" }
                ]
            },
            {
                name: "Global Hits",
                clues: [
                    { value: 100, clue: "This 2021 song by Olivia Rodrigo became a smash hit, topping global charts and becoming a TikTok anthem", answer: "what is drivers license" },
                    { value: 200, clue: "This 2016 track by Drake featuring Rihanna became one of the most-streamed songs on Spotify", answer: "what is work" },
                    { value: 300, clue: "This 2019 hit by Shawn Mendes and Camila Cabello topped the charts and became an international sensation", answer: "what is senorita" },
                    { value: 400, clue: "This K-pop group, known for hits like 'Dynamite' and 'Butter', broke multiple streaming records on Spotify", answer: "who is bts" },
                    { value: 500, clue: "This 2020 song by Cardi B and Megan Thee Stallion sparked controversy and became one of the most-streamed songs of the year", answer: "what is wap" }
                ]
            },
            {
                name: "Music History",
                clues: [
                    { value: 100, clue: "This composer's 'Symphony No. 9' is known as the 'Choral Symphony' and features 'Ode to Joy'", answer: "who is beethoven" },
                    { value: 200, clue: "This 1940s-50s music genre featured artists like Chuck Berry and Little Richard", answer: "what is rock and roll" },
                    { value: 300, clue: "This iconic music festival took place in August 1969 in upstate New York", answer: "what is woodstock" },
                    { value: 400, clue: "This rapper's debut album 'The Slim Shady LP' won a Grammy in 2000", answer: "who is eminem" },
                    { value: 500, clue: "This composer wrote 'The Four Seasons'", answer: "who is vivaldi" }
                ]
            }
        ]
    };
    
    function initializeGame() {
        currentScore = 0;
        questionsRemaining = 25;
        currentScoreDisplay.textContent = currentScore;
        questionsRemainingDisplay.textContent = questionsRemaining;
        createJeopardyBoard();
        updateHighScore();
    }
    
    // jeopardy board creation
    function createJeopardyBoard() {
        jeopardyGrid.innerHTML = '';
        
        for (let value of [100, 200, 300, 400, 500]) {
            for (let categoryIndex = 0; categoryIndex < gameData.categories.length; categoryIndex++) {
                const tile = document.createElement('div');
                tile.className = 'jeopardy-tile';
                tile.dataset.category = categoryIndex;
                tile.dataset.value = value;
                
                const valueDisplay = document.createElement('span');
                valueDisplay.textContent = '$' + value;
                
                tile.appendChild(valueDisplay);
                
                // on click, show
                tile.addEventListener('click', function() {
                    if (!this.classList.contains('answered')) {
                        showQuestion(parseInt(this.dataset.category), parseInt(this.dataset.value));
                        this.classList.add('answered');
                    }
                });
                
                jeopardyGrid.appendChild(tile);
            }
        }
    }

    // question modal showing
    function showQuestion(categoryIndex, value) {
        const category = gameData.categories[categoryIndex];
        const clueIndex = value / 100 - 1;
        const clue = category.clues[clueIndex];
        
        modalCategory.textContent = category.name;
        modalCategory.dataset.index = categoryIndex;
        modalValue.textContent = '$' + value;
        questionText.textContent = clue.clue;
        
        timeLeft = 10;
        timerCount.textContent = timeLeft;
        timerBar.style.width = '100%';
        answerInput.value = '';
        
        questionModal.classList.add('show');
        
        setTimeout(() => {
            answerInput.focus();
        }, 500);
        
        startTimer(categoryIndex, value);
    }
    
    function startTimer(categoryIndex, value) {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        // inspiration: https://css-tricks.com/timer-bars-in-css-with-custom-properties/
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        setTimeout(() => {
            timerBar.style.transition = 'width 10s linear';
            timerBar.style.width = '0%';
        }, 50);
        
        timerInterval = setInterval(function() {
            timeLeft--;
            timerCount.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                answerInput.disabled = true;
                handleTimeUp(categoryIndex, value);
            }
        }, 1000);
    }
    
    function handleTimeUp(categoryIndex, value) {
        const category = gameData.categories[categoryIndex];
        const clueIndex = value / 100 - 1;
        const clue = category.clues[clueIndex];
        
        questionModal.classList.remove('show');
        
        feedbackContainer.innerHTML = `
            <div class="feedback incorrect">
                <h3>Time's Up!</h3>
                <p>The correct response was: "${clue.answer}"</p>
                <p class="score-change">-$${value}</p>
            </div>
        `;
        
        updateScore(-value);
        
        feedbackModal.classList.add('show');
        
        questionsRemaining--;
        questionsRemainingDisplay.textContent = questionsRemaining;
        
        checkGameOver();
    }

    function handleAnswer(categoryIndex, value) {
        clearInterval(timerInterval);
        
        if (isNaN(categoryIndex) || isNaN(value) || 
            categoryIndex < 0 || categoryIndex >= gameData.categories.length ||
            value < 100 || value > 500) {
            console.error('Invalid category index or value:', categoryIndex, value);
            return;
        }
        
        const category = gameData.categories[categoryIndex];
        const clueIndex = value / 100 - 1;
        const clue = category.clues[clueIndex];
          const userAnswer = answerInput.value.trim().toLowerCase();
        
        questionModal.classList.remove('show');
        
        // more lenient answer checks (we can add contains, etc. right now simple strip)
        const normalizedUserAnswer = userAnswer.replace(/\s+/g, ' ');
        const normalizedCorrectAnswer = clue.answer.replace(/\s+/g, ' ');
        
        // console.log('User answer:', normalizedUserAnswer);
        // console.log('Correct answer:', normalizedCorrectAnswer);
        
        let isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        
        if (isCorrect) {
            feedbackContainer.innerHTML = `
                <div class="feedback correct">
                    <h3>Correct!</h3>
                    <p>Your response: "${userAnswer}"</p>
                    <p class="score-change">+$${value}</p>
                </div>
            `;
            updateScore(value);
        } else {
            feedbackContainer.innerHTML = `
                <div class="feedback incorrect">
                    <h3>Incorrect!</h3>
                    <p>Your response: "${userAnswer}"</p>
                    <p>The correct response was: "${clue.answer}"</p>
                    <p class="score-change">-$${value}</p>
                </div>
            `;
            updateScore(-value);
        }
        
        feedbackModal.classList.add('show');
        questionsRemaining--;
        questionsRemainingDisplay.textContent = questionsRemaining;
        
        checkGameOver();
    }
    
    function updateScore(points) {
        currentScore += points;
        currentScoreDisplay.textContent = currentScore;
    }

    // 🔁 Reusable helper to safely fetch scores
async function getGameScore(spotifyId){
    try{
        const res = await fetch(`http://localhost:5001/api/get_user_scores/${spotifyId}`);
        const scores = await res.json();
        console.log("user scores from api: ", scores);
        return scores;
    }
     catch (err) {
    console.error("Failed to fetch user scores", err);
            return {
            finish_lyrics_score: 0,
            guess_the_song_score: 0,
            jeopardy_score: 0
        };
  }
}

// 🧠 High score updater function
async function updateHighScore() {

    let user = JSON.parse(localStorage.getItem('userInfo'));

    let userId = user.spotify_id;
    console.log("This is userid in update highscore: ", userId);

    const scores = await getGameScore(userId);

    let jeopardy_high_score = document.getElementById('jeopardy-current-high-score');
    jeopardy_high_score.textContent = scores.jeopardy_score;

}

    
    function checkGameOver() {
        if (questionsRemaining <= 0) {
            finalScoreDisplay.textContent = currentScore;
            
            if (currentScore >= 3000) {
                performanceMessage.textContent = "👑 Amazing! 👑";
            } else if (currentScore >= 1000) {
                performanceMessage.textContent = "😄 Great job! You know your music trivia! 😄";
            } else if (currentScore > 0) {
                performanceMessage.textContent = "😑 Not bad! Keep playing to improve your score. 😑";
            } else {
                performanceMessage.textContent = "😭 Better luck next time! 😭";
            }
            
            continueBtn.addEventListener('click', function showGameOver() {
                feedbackModal.classList.remove('show');
                gameOverModal.classList.add('show');
                continueBtn.removeEventListener('click', showGameOver);
            }, { once: true });

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
                        jeopardy_score: currentScore
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
    }
    
    answerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (answerInput.value.trim() !== '') {
            const categoryIndex = parseInt(modalCategory.dataset.index);
            const value = parseInt(modalValue.textContent.replace('$', ''));
            handleAnswer(categoryIndex, value);
        }
    });

    continueBtn.addEventListener('click', function() {
        feedbackModal.classList.remove('show');
        answerInput.disabled = false;
        answerInput.value = '';
    });
    
    playAgainBtn.addEventListener('click', function() {
        gameOverModal.classList.remove('show');
        initializeGame();
    });
    
    initializeGame();
});
