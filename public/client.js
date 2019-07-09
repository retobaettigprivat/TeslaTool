"use strict";

function isDebug() {
   return (window.location.href.indexOf('localhost')>=0
       || window.location.href.indexOf('127.0.0.1')>=0);
}

if (location.protocol != 'https:' && !isDebug()) {
    location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

let appstate = {
    accessToken : false,
    apiCallActive : false,
    numcallsok : 0,
    numcallsfailed : 0,
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
    if (tesladata.state.value === 'online') {
        Show("mainpage");
        Hide("wakeup")
    } else {
        Hide("mainpage");
        Show("wakeup");
        Elem("wakestate").innerHTML="Your tesla is not online but in state: "+tesladata.state.value;
    }

}
function renderLoggedOut() {
    Show("divlogin");
    Hide("divlogout");
    Hide("mainpage");
    Hide("wakeup");
}

function renderInfos() {
    let e = Elem("infotable");

    /*let r = new Array();
    for (let key in tesladata){
        r.push('<tr><td>');
        r.push(key);
        r.push('</td><td>');
        r.push(tesladata[key]);
        r.push('</td></tr>');
    }
    e.innerHTML=r.join('');*/
    e.innerHTML = teslaGetTable();
    Elem("commstats").innerHTML = appstate.numcallsok+"/"+appstate.numcallsfailed;
}

function render() {
    if (isDebug()) { Show("logwrapper") }
    if (appstate.isLoggedIn()) {
        renderLoggedIn();
        renderInfos();
    } else {
        renderLoggedOut();
    }
}

function log(str) {
    console.log(str);
    let l = Elem("logdiv");
    if (typeof l !== "undefined") {
        l.innerHTML+=str + "\n";
    }
}
function clearLog() {
    if (typeof Elem("logdiv") !== 'undefined') {
        Elem("logdiv").innerHTML ="";
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
            appstate.numcallsok++;
            return response.json();
        }).then((data) => {
            try {
                if (data.data.indexOf("error: 408") >= 0) {
                    tesladata.state.value = "offline";
                }
            } catch { }
            return data;
        }).catch((err) => {
            appstate.numcallsfailed++;
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
    if (appstate.apiCallActive) {
        return false;
    } else {
        appstate.apiCallActive = true;
        apiFetchBg('./api/getinfo', 'GET')
            .then(data => {
                appstate.apiCallActive = false;
                teslarawdata = data.data.response;
                teslaParseData(data);
                render();
            })
            .catch(() => {
                appstate.apiCallActive = false;
            });
    }
}

function showRawData(on) {
    if (on) {
        Show("rawdata");
        Elem("rawdatatext").innerHTML = JSON.stringify(teslarawdata, null, 2);
    } else {
        Hide("rawdata");
    }
}

function standardApiCall(url, method, value) {
    return apiFetch(url, method, value)
        .then(res => {
            if (typeof res.data.response.result === 'undefined') {
                log(JSON.stringify(res, null, 2));
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
            tesladata.state.value = res.data.response.state;
            log(JSON.stringify(res.data, null, 2));
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

window.setInterval(getInfo, 5000);