/*******************
 * Tesla Module
 * Handles the communication with the inofficial Tesla API
 * See https://tesla-api.timdorr.com/
 * (c) 2019 by Reto Bättig (reto@baettig.org)
 */

const logger = require('./logger.js');
const fetch = require('node-fetch');

const hosturl = "https://owner-api.teslamotors.com";

const log = logger.log;

// cache
let _vehicles = {};

let getDefaultOptions = function (access_token, method) {
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
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
    };
    if (access_token) {
        opts.headers.Authorization = 'Bearer ' + access_token;
    }
    return opts;
};

let getUrl = function(access_token, vehicleIndex, command) {
    let url = hosturl + command;
    if (access_token && typeof _vehicles[access_token] !== 'undefined') {
        url = url.replace("{id}",_vehicles[access_token][vehicleIndex].id_s);
    }
    return url;
};

let apiFetch = function(url, opt) {
    return fetch(url, opt)
        .then(function (response) {
            if (!response.ok) {
                let errTxt = "fetch() error: "+response.status + ": "+response.statusText;
                throw errTxt;
            }
            return response.json();
        })
        .catch(function (error) {
            log("Error in apiFetch:");
            log(error);
            return Promise.reject(error);
        });
};

let apiPost = function (access_token, vehicleindex, command, data) {
    // command in following form: /api/1/vehicles/{id}/wake_up
    let url = getUrl(access_token,vehicleindex, command);

    let opt = getDefaultOptions(access_token, "POST");
    if (typeof data !== 'undefined') {
        opt.body=JSON.stringify(data);
    }

    return apiFetch(url, opt);
};

let apiGet = function (access_token, vehicleindex, command) {
    // command in following form: /api/1/vehicles/{id}/wake_up
    let url = getUrl(access_token, vehicleindex, command);
    let opt = getDefaultOptions(access_token, "GET");

    return apiFetch(url, opt);
};

let login = function (email, password) {
    const data =
        {
            "grant_type": "password",
            "client_id": "81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384",
            "client_secret": "c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3",
            "email": email,
            "password": password
        };
    return apiPost(false, 0, '/oauth/token?grant_type=password', data)
        .then(response => {
            if (typeof response.access_token !== 'undefined') {
                return {access_token:response.access_token};
            } else {
                return false;
            }
        });
};

let getVehicles = function (access_token) {
    if (typeof _vehicles[access_token] !== 'undefined') {
        return Promise.resolve(_vehicles[access_token]);
    }
    return apiGet(access_token, 0, '/api/1/vehicles')
        .then(data => {
            _vehicles[access_token] = data.response;
            return data;
        });
};

let logout = function(access_token) {
    if (typeof _vehicles[access_token] !== 'undefined') {
        delete _vehicles[access_token];
    }
};

module.exports = {
    login: login,
    logout: logout,
    getVehicles: getVehicles,
    getVehicleData: (access_token, id) => apiGet(access_token, id, '/api/1/vehicles/{id}/vehicle_data'),
    wakeUp: (access_token, id) => apiPost(access_token, id, '/api/1/vehicles/{id}/wake_up'),
    honkHorn: (access_token, id) => apiPost(access_token, id, '/api/1/vehicles/{id}/command/honk_horn'),
    flashLights: (access_token, id) => apiPost(access_token, id, '/api/1/vehicles/{id}/command/flash_lights'),
    setSentryMode: (access_token, id, on) => apiPost(access_token, id, '/api/1/vehicles/{id}/command/set_sentry_mode', { 'on' : on }),

};
