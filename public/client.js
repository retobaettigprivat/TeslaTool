"use strict";


if (location.protocol != 'https:' && window.location.href.indexOf('localhost')==-1)
{
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}


let appstate = {
    accessToken : false,
    isLoggedIn : () => { return appstate.accessToken!==false; },
};

function Elem(id) {
    return document.getElementById(id);
}
function Show(id) {
    Elem(id).style.display = "block";
}
function Hide(id) {
    Elem(id).style.display = "none";
}

function renderLoggedIn() {
    Hide("divlogin");
    Show("divlogout");
    Show("mainpage");
    }
function renderLoggedOut() {
    Show("divlogin");
    Hide("divlogout");
    Hide("mainpage");
}

function render() {
    if (appstate.isLoggedIn()) {
        renderLoggedIn();
    } else {
        renderLoggedOut();
    }
}

function log(str) {
    console.log(str);
    let l = document.getElementById("logdiv");
    if (typeof l !== "undefined") {
        l.innerHTML+=str + "<br>\n";
    }
}

let getDefaultOptions = function (method) {
    if (typeof method === 'undefined') {
        method = 'GET';
    }
    let opts =
        {
            method: method, // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                'Content-Type': 'application/json',
            }
        };
    if (appstate.accessToken) {
        opts.headers.Authorization = 'Bearer ' + appstate.accessToken;
    }
    return opts;
};

function apiFetch(url, method, data) {
    let opts= getDefaultOptions(method);
    if (typeof data !== 'undefined') {
        opts.body=JSON.stringify(data);
    }
    Show("wait");
    return fetch(url, opts)
        .then((response) => {
            Hide("wait");
            return response.json();
        })
        .catch((err) => {
            Hide("wait");
            log(err.message);
        });
}

function login() {
    let email = document.getElementById("email").value;
    let pw = document.getElementById("pword").value;
    apiFetch('./api/login', 'POST', { 'email':email, 'pw':pw})
        .then(result => {
            if (result.success) {
                appstate.accessToken = result.data.access_token;
                render();
            } else {
                window.alert("Access denied");
            }
        });
    return false;
}

function logout() {
    appstate.accessToken = false;
    apiFetch('./api/logout', 'POST')
        .then(data => {
            log(JSON.stringify(data));
        });
    render();
}

function getInfo() {
    apiFetch('./api/getinfo', 'GET')
        .then(data => {
            log(JSON.stringify(data));
        });
}

function wakeUp() {
    apiFetch('./api/wakeup', 'POST')
        .then(data => {
            log(JSON.stringify(data));
        });
}

function flashLights() {
    apiFetch('./api/flashlights', 'POST')
        .then(data => {
            log(JSON.stringify(data));
        });
}

function honkHorn() {
    apiFetch('./api/honkhorn', 'POST')
        .then(data => {
            log(JSON.stringify(data));
        });
}

function sentryOn() {
    apiFetch('./api/setsentrymode', 'POST', {value: true})
        .then(data => {
            log(JSON.stringify(data));
        });
}

function sentryOff() {
    apiFetch('./api/setsentrymode', 'POST', {value: false})
        .then(data => {
            log(JSON.stringify(data));
        });
}


