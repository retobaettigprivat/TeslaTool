"use strict";

const unknown = "(unknown)";

let tesladata = {
    name : unknown,
    battery_level : unknown,
    state: unknown,
    est_battery_range: unknown,
    ideal_battery_range: unknown,
    heading: unknown,
    latitude: unknown,
    longitude: unknown,
};

let teslaParseData = function(data) {
    if (!data.success) { log(data) }

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
    } catch {
        log(data);
    }

};