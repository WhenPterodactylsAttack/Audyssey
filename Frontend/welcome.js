document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-primary');
    const modal = document.getElementById('authModal');
    const closeBtn = document.querySelector('.close-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const getStartedBtn = document.querySelector('.hero-content .btn-large');
    const spotifyBtn = document.querySelector('.btn-spotify');
    


    // Function to handle Spotify login
    function handleSpotifyLogin() {
        // Check if we're returning from Spotify auth with a token
        const hash = window.location.hash.substring(1);
        console.log("Hash from URL:", hash); // Debug log
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get('access_token');
        console.log("Access token found:", access_token); // Debug log
        
        if (access_token) {
            // If we have a token, redirect to games page with the token in the hash
            const redirectUrl = `games.html${window.location.hash}`;
            console.log("Redirecting to:", redirectUrl); // Debug log
            window.location.href = redirectUrl;
        } else {
            // If no token, redirect to backend login
            window.location.href = 'http://127.0.0.1:5000/login';
        }
    }

    // Listen for hash changes
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substring(1);
        console.log("Hash changed to:", hash); // Debug log
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get('access_token');
        console.log("Access token from hash change:", access_token); // Debug log
        
        if (access_token) {
            const redirectUrl = `games.html${window.location.hash}`;
            console.log("Redirecting to:", redirectUrl); // Debug log
            window.location.href = redirectUrl;
        }
    });

    spotifyBtn.addEventListener('click', function() {
        handleSpotifyLogin();
    });

    // Check for token on initial page load
    const initialHash = window.location.hash.substring(1);
    console.log("Initial hash:", initialHash); // Debug log
    const initialParams = new URLSearchParams(initialHash);
    const initialToken = initialParams.get('access_token');
    console.log("Initial token:", initialToken); // Debug log
    
    if (initialToken) {
        const redirectUrl = `games.html${window.location.hash}`;
        console.log("Redirecting to:", redirectUrl); // Debug log
        window.location.href = redirectUrl;
    }

    // login tab modal
    loginBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        showTab('login');
    });
    
    // signup tab
    signupBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        showTab('signup');
    });
    
    // close
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    function showTab(tabName) {
        tabBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        tabContents.forEach(content => {
            if (content.id === tabName) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    }

    getStartedBtn.addEventListener('click', function() {
        modal.style.display = 'flex';
        showTab('login');
    });
    
    // placeholder for auth stuff (@backend people)
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            modal.style.display = 'none';
            window.location.href= './games.html'; // redirect to games page after login/signup
        });
    });
});

function signIn() {
    oauth2Endpoint = 'https:accounts.google.com/o/oauth2/v2/auth';
    let form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint);
// Lk_rQ_ivlOLwz15gofLXowB7WIa1
    let params = {
        "client_id": "644111798598-uru8seebm860hv8dbdhh8vpivtgmldg2.apps.googleusercontent.com",
        "redirect_uri": "http://127.0.0.1:5501/Frontend/games.html",
        "response_type": "token",
        "scope": "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        "state": "pass-through_value"
    }

    for (var p in params) {
        let input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', p);
        input.setAttribute('value', params[p]);
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
}