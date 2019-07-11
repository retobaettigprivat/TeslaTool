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
    apiCallVehicleId : 0,
    numcallsok : 0,
    numcallsfailed : 0,
    vehicles : false,
    selectedvehicleidx : 0,
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
    e.innerHTML = teslaGetTable();
    Elem("commstats").innerHTML = appstate.numcallsok+"/"+appstate.numcallsfailed;
}

function renderVehicles() {
    let e = Elem("vehicles");
    let s = "";
    appstate.vehicles.forEach((vehicle) => {
       s+="<option>"+vehicle.display_name+"</option>";
    });
    e.innerHTML = s;
    Elem("vehicles").selectedIndex = appstate.selectedvehicleidx;
}

function render() {
    if (isDebug()) { Show("logwrapper") }
    if (appstate.isLoggedIn()) {
        renderLoggedIn();
        renderVehicles();
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

let getVehicleId = function() {
    let idx = appstate.selectedvehicleidx;
    if (typeof appstate.vehicles[idx] !== 'undefined') {
        return appstate.vehicles[idx].id_s;
    }
    return 0;
};

function changeVehicle() {
    appstate.selectedvehicleidx = Elem("vehicles").selectedIndex;
    appstate.apiCallActive = false;
    clearTeslaData();
    render();
    getInfo();
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
                getVehicles();
            } else {
                window.alert("Access denied");
            }
        });
    return false;
}

function getInfo() {
    function _startBgApiCall() {
        appstate.apiCallActive = true;
        appstate.apiCallVehicleId = getVehicleId();
    }

    function _finishBgApiCall() {
        appstate.apiCallActive = false;
    }

    function _callIsActiveOrNoVehicle() {
        return appstate.apiCallActive || !appstate.vehicles;
    }

    function _dataMatchesSelectedCar(res){
        return res.data.response.id_s == getVehicleId()
    }

    if (_callIsActiveOrNoVehicle()) {
        return false;
    } else {
        _startBgApiCall();
        apiFetchBg('./api/'+getVehicleId()+'/getinfo', 'GET')
            .then(res => {
                _finishBgApiCall();
                if (typeof res.data.response !== 'undefined') {
                    if (_dataMatchesSelectedCar(res)) {
                        teslarawdata = res.data.response;
                        teslaParseData(res.data.response);
                    }
                } else {
                    tesladata.state.value = 'offline';
                }
                render();
            })
            .catch(() => {
                _finishBgApiCall();
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
            if (typeof res.data.response === 'undefined') {
                log(JSON.stringify(res, null, 2));
            }
            return res;
        });
}

function logout() {
    standardApiCall('./api/logout', 'POST')
        .then(()=> {
            appstate.accessToken = false;
            render();
        });
}

function wakeUp() {
    standardApiCall('./api/'+getVehicleId()+'/wakeup', 'POST')
        .then(res => {
            tesladata.state.value = res.data.response.state;
            log(JSON.stringify(res.data, null, 2));
        });
}

function flashLights() {
    standardApiCall('./api/'+getVehicleId()+'/flashlights', 'POST');
}

function honkHorn() {
    standardApiCall('./api/'+getVehicleId()+'/honkhorn', 'POST');
}

function sentryOn() {
    standardApiCall('./api/'+getVehicleId()+'/setsentrymode', 'POST', {value: true});
}

function sentryOff() {
    standardApiCall('./api/'+getVehicleId()+'/setsentrymode', 'POST', {value: false});
}

function LockDoors() {
    standardApiCall('./api/'+getVehicleId()+'/lockdoors', 'POST');
}

function UnlockDoors() {
    standardApiCall('./api/'+getVehicleId()+'/unlockdoors', 'POST');
}

function openTrunk() {
    standardApiCall('./api/'+getVehicleId()+'/opentrunk', 'POST');
}

function openFrunk() {
    standardApiCall('./api/'+getVehicleId()+'/openfrunk', 'POST');
}

function getVehicleData() {
    standardApiCall('./api/'+getVehicleId()+'/getvehicledata', 'GET')
        .then((res) => {
            log(JSON.stringify(res, null, 2));
        })
}

function getVehicles() {
    standardApiCall('./api/getvehicles', 'GET')
        .then((res) => {
            appstate.vehicles = res.data.response;
            teslarawdata = res.data.response[0];
            teslaParseData(res.data.response[0]);
            render();
        })
}

window.setInterval(getInfo, 5000);