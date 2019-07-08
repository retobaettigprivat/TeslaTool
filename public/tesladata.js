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
    if (!data.success) {
        return false;
    }

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