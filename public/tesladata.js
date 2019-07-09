"use strict";

const unknown = "(unknown)";

let teslarawdata = unknown;
let tesladata = {
    name : unknown,
    battery_level : unknown,
    state: unknown,
    est_battery_range: unknown,
    ideal_battery_range: unknown,
    heading: unknown,
    latitude: unknown,
    longitude: unknown,
    locked: unknown,
    sentry_mode: unknown,
    odometer: unknown,
};

let teslaParseData = function(data) {
    if (typeof data.success === 'undefined') {
        return false;
    }

    teslaParseData2(data);

    try {
        let d=data.data.response;
        if (typeof d.display_name !== 'undefined') { tesladata.name = d.display_name};
        if (typeof d.state !== 'undefined') { tesladata.state = d.state};
        if (typeof d.charge_state.battery_level !== 'undefined') { tesladata.battery_level = d.charge_state.battery_level};
        if (typeof d.charge_state.battery_range !== 'undefined') { tesladata.battery_range = d.charge_state.battery_range};
        if (typeof d.charge_state.est_battery_range !== 'undefined') { tesladata.est_battery_range = d.charge_state.est_battery_range};
        if (typeof d.charge_state.ideal_battery_range !== 'undefined') { tesladata.ideal_battery_range = d.charge_state.ideal_battery_range};
        if (typeof d.drive_state.heading !== 'undefined') { tesladata.heading = d.drive_state.heading};
        if (typeof d.drive_state.latitude !== 'undefined') { tesladata.latitude = d.drive_state.latitude};
        if (typeof d.drive_state.longitude !== 'undefined') { tesladata.longitude = d.drive_state.longitude};
        if (typeof d.vehicle_state.locked !== 'undefined') { tesladata.locked = d.vehicle_state.locked};
        if (typeof d.vehicle_state.sentry_mode !== 'undefined') { tesladata.sentry_mode = d.vehicle_state.sentry_mode};
        if (typeof d.vehicle_state.odometer !== 'undefined') { tesladata.odometer = d.vehicle_state.odometer};

    } catch {
        log(data);
    }

};

let cMilesKm = function(miles) {
    return miles * 1.60934;
}
let tesladata2 = {
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

let getResponseValue = function(data, path) {
    let value = unknown;
    try {
        value=data.data.response;
        let subpath = path.split(".");
        for (let i=0; i<subpath.length; i++) {
            value=value[subpath[i]];
        }
    } catch {
        return unknown;
    }

    return value;
}

let teslaParseData2 = function(data) {
    if (typeof data.success === 'undefined') {
        return false;
    }
    for (let key in tesladata2) {
        if (tesladata2.hasOwnProperty(key)) {
            tesladata2[key].value = getResponseValue(data, tesladata2[key].path);
        }
    }
};

let teslaGetTable = function() {
    let s="";
    let r = new Array();
    for (let key in tesladata2){
        r.push('<tr><td>');
        r.push(tesladata2[key].name);
        r.push('</td><td>');
        if (typeof tesladata2[key].converter !== 'undefined') {
            s=tesladata2[key].converter(tesladata2[key].value);
        } else {
            s=tesladata2[key].value;
        }
        if (typeof tesladata2[key].unit !== 'undefined') {
            s+=tesladata2[key].unit;
        }
        r.push(s);
        r.push('</td></tr>');
    }
    return r.join('');
};