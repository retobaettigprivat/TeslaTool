"use strict";

const unknown = "(unknown)";

let teslarawdata = unknown;

let cMilesKm = function(miles) {
    return Math.round(miles * 1.60934 *10)/10;
};

let tesladata = {
    name :              {name: "Name",                  path: "display_name",                   value: unknown},
    battery_level :     {name: "Battery Level",         path: "charge_state.battery_level",     value: unknown, unit: "%"},
    state:              {name: "State",                 path: "state",                          value: unknown},
    est_battery_range:  {name: "Est. Battery Range",    path: "charge_state.est_battery_range", value: unknown, unit: "km", converter: cMilesKm},
    ideal_battery_range:{name: "Ideal Battery Range",   path: "charge_state.ideal_battery_range", value: unknown, unit: "km", converter: cMilesKm},
    heading:            {name: "Heading",               path: "drive_state.heading",            value: unknown},
    latitude:           {name: "Latitude",              path: "drive_state.latitude",           value: unknown},
    longitude:          {name: "Longitude",             path: "drive_state.longitude",          value: unknown},
    locked:             {name: "Locked",                path: "vehicle_state.locked",           value: unknown},
    sentry_mode:        {name: "Sentry Mode",           path: "vehicle_state.sentry_mode",      value: unknown},
    odometer:           {name: "Odometer",              path: "vehicle_state.odometer",         value: unknown, unit: "km", converter: cMilesKm},
};

let clearTeslaData =function() {
    for (let key in tesladata) {
        if (tesladata.hasOwnProperty(key)) {
            tesladata[key].value = unknown;
        }
    }
};

let getResponseValue = function(data, path) {
    let value = unknown;
    try {
        value=data;
        let subpath = path.split(".");
        for (let i=0; i<subpath.length; i++) {
            value=value[subpath[i]];
        }
    } catch (e){
        return unknown;
    }

    return value;
};

let teslaParseData = function(data) {
    if (typeof data === 'undefined' || !data) {
        return false;
    }
    for (let key in tesladata) {
        if (tesladata.hasOwnProperty(key)) {
            tesladata[key].value = getResponseValue(data, tesladata[key].path);
        }
    }
};

let teslaGetTable = function() {
    let s="";
    let r = new Array();
    for (let key in tesladata){
        r.push('<tr><td>');
        r.push(tesladata[key].name);
        r.push('</td><td>');
        if (typeof tesladata[key].converter !== 'undefined') {
            s=tesladata[key].converter(tesladata[key].value);
        } else {
            s=tesladata[key].value;
        }
        if (typeof tesladata[key].unit !== 'undefined') {
            s+=tesladata[key].unit;
        }
        r.push(s);
        r.push('</td></tr>');
    }
    return r.join('');
};