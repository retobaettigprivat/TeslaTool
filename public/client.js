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

function renderInfos() {
    /*let s="<table></table><tr><td>hello</td><td>hello Reto</td></tr></table>";
    let e = Elem("infos");
    e.innerHTML=s;*/
    let e = Elem("infotable");

    let r = new Array();
    for (let key in tesladata){
        r.push('<tr><td>');
        r.push(key);
        r.push('</td><td>');
        r.push(tesladata[key]);
        r.push('</td></tr>');
    }
    e.innerHTML=r.join('');
}

function render() {
    if (appstate.isLoggedIn()) {
        renderLoggedIn();
        renderInfos();
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

function apiFetchFgBg(url, method, foreground, data) {
    let opts= getDefaultOptions(method);
    if (typeof data !== 'undefined') {
        opts.body=JSON.stringify(data);
    }

    if (foreground) { Show("wait"); }
    return fetch(url, opts)
        .then((response) => {
            Hide("wait");
            return response.json();
        }).then((data) => {
            try {
                if (data.data.indexOf("error: 408") >= 0) {
                    tesladata.state = "offline";
                }
            } catch { }
            return data;
        }).catch((err) => {
            Hide("wait");
            log(err.message);
        });
}

function apiFetch (url, method, data) {
    return apiFetchFgBg(url, method, true, data);
}

function apiFetchBg (url, method, data) {
    return apiFetchFgBg(url, method, false, data);
}


function login() {
    let email = document.getElementById("email").value;
    let pw = document.getElementById("pword").value;
    apiFetch('./api/login', 'POST', { 'email':email, 'pw':pw})
        .then(result => {
            if (result.success) {
                appstate.accessToken = result.data.access_token;
                getInfo();
                render();
            } else {
                window.alert("Access denied");
            }
        });
    return false;
}

function getInfo() {
    apiFetchBg('./api/getinfo', 'GET')
        .then(data => {
            teslarawdata = data.data.response;
            teslaParseData(data);
            render();
        });
}

function showRawData(on) {
    if (on) {
        Show("rawdata");
        Elem("rawdatatext").innerHTML = JSON.stringify(teslarawdata, null, "<br>");
    } else {
        Hide("rawdata");
    }
}

function standardApiCall(url, method, value) {
    return apiFetch(url, method, value)
        .then(res => {
            if (!res.data.response.result) {
                log(JSON.stringify(res));
            }
            getInfo();
        });
}

function logout() {
    appstate.accessToken = false;
    standardApiCall('./api/logout', 'POST');
    render();
}

function wakeUp() {
    standardApiCall('./api/wakeup', 'POST')
        .then(res => {
            tesladata.state = res.data.response.state;
        });
}

function flashLights() {
    standardApiCall('./api/flashlights', 'POST');
}

function honkHorn() {
    standardApiCall('./api/honkhorn', 'POST');
}

function sentryOn() {
    standardApiCall('./api/setsentrymode', 'POST', {value: true});
}

function sentryOff() {
    standardApiCall('./api/setsentrymode', 'POST', {value: false});
}

function LockDoors() {
    standardApiCall('./api/lockdoors', 'POST');
}

function UnlockDoors() {
    standardApiCall('./api/unlockdoors', 'POST');
}

function openTrunk() {
    standardApiCall('./api/opentrunk', 'POST');
}

function openFrunk() {
    standardApiCall('./api/openfrunk', 'POST');
}
