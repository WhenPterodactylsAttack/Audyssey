document.addEventListener('DOMContentLoaded', function() {
    // Get access token from URL
    let params = {}
    let hash = window.location.hash.substring(1); // Get the hash part without the #
    let regex = /([^&=]+)=([^&]*)/g, m;

    while (m = regex.exec(hash)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }

    if(Object.keys(params).length > 0) {
        localStorage.setItem("spotifyAuthInfo", JSON.stringify(params));
    }

    //hide access token from URL
    window.history.pushState({}, document.title, window.location.pathname);

    let spotifyInfo = JSON.parse(localStorage.getItem("spotifyAuthInfo"));
    console.log("Spotify Access Token in intro:", spotifyInfo["access_token"]);

    // Handle Start Game button click
    const startGameBtn = document.getElementById('startGameBtn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            const access_token = spotifyInfo["access_token"];
            if (access_token) {
                window.location.href = `guess_game_round.html#access_token=${access_token}`;
            } else {
                console.error("No access token found");
            }
        });
    }
}); 