let params = {}

let regex = /([^&=]+)=([^&]*)/g, m;

while (m = regex.exec(location.href)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}

if(Object.keys(params).length > 0) {
    localStorage.setItem("authInfo", JSON.stringify(params));
}

//hide access token from URL
window.history.pushState({}, document.title, window.location.pathname);

let info = JSON.parse(localStorage.getItem("authInfo"));
console.log(info["access_token"]);
console.log(info["expires_in"]);

fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
        Authorization: `Bearer ${info["access_token"]}` 
    }
})
.then((data) => data.json())
.then((info) => {
    console.log(info);
    localStorage.setItem("userInfo", JSON.stringify(info));
    //document.getElementById("account").textContent += info.name;
    document.getElementById("account-image").setAttribute("src", info.picture);
})

function logout() {
    localStorage.removeItem("token");
    window.location.href = "welcome.html";
}
