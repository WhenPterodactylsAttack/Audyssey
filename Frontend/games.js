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
    console.log("Spotify Access Token:", spotifyInfo["access_token"]);

    // Handle Guess the Song link click
    const guessSongLink = document.getElementById('guessSongLink');
    if (guessSongLink) {
        guessSongLink.addEventListener('click', function(e) {
            e.preventDefault();
            const access_token = spotifyInfo["access_token"];
            if (access_token) {
                window.location.href = `Guess The Song/guess_game_intro.html#access_token=${access_token}`;
            } else {
                console.error("No access token found");
            }
        });
    }

    // Comment out Google auth logic
    /*
    fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
            Authorization: `Bearer ${info["access_token"]}` 
        }
    })
    .then((data) => data.json())
    .then((info) => {
        console.log(info);
        localStorage.setItem("userInfo", JSON.stringify(info));
        document.getElementById("account-image").setAttribute("src", info.picture);
    })
    */
});

function logout() {
    localStorage.removeItem("spotifyAuthInfo");
    window.location.href = "index.html";
}
