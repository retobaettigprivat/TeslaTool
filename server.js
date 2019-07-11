"use strict"
const logger = require('./logger.js');
const tesla = require('./tesla.js');
const express = require('express');
let bodyParser = require("body-parser");
const app = express();

//let PORT = process.env.PORT;
let PORT = process.env.PORT || 3000;

function getToken(req) {
    let prefix='Bearer ';
    let t = req.get('authorization');
    if (!t) { return false;}
    if (t.indexOf(prefix) === 0) {
        t = t.substring(prefix.length, t.length);
    }
    return t;
}


/**********************/
/* Unprotected routes */
/**********************/
app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/api/login', (req, res) => {
    tesla.login(req.body.email, req.body.pw)
        .then(data => {
            res.send({success: true, data: data});
        })
        .catch(data => {
            res.status(500).send({success: false, data : data});
        });
});
/********************/
/* Protected routes */
/********************/
function checkAuth(req, res, next) {
    if (!getToken(req)) {
        logger.log("Not authorized");
        return res.status(403).json({ success: false, data: 'Error: No credentials sent!' });
    }
    next();
}
app.use(checkAuth);

function handleSimplePromise(promise, res) {
    promise
        .then((data) => {
            res.send({success: true, data: data});
        })
        .catch(data => {
            res.status(500).send({success: false, data : data});
        });
}

app.get('/api/:vehicleid/getinfo', (req, res) => {
    let vehicleid = req.params.vehicleid;
    tesla.getVehicles(getToken(req))
        .then(() => {
            handleSimplePromise(tesla.getVehicleData(getToken(req), vehicleid), res);
        })
        .catch(data => {
            res.status(500).send({success: false, data : data});
        });
});

app.get('/api/:vehicleid/getvehicledata', (req, res) => {
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.getVehicleData(getToken(req), vehicleid), res);
});

app.get('/api/getvehicles', (req, res) => {
    handleSimplePromise(tesla.getVehicles(getToken(req)), res);
});

app.post('/api/:vehicleid/wakeup', (req, res) => {
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.wakeUp(getToken(req), vehicleid), res);
});

app.post('/api/:vehicleid/honkhorn', (req, res) => {
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.honkHorn(getToken(req), vehicleid), res);
});

app.post('/api/:vehicleid/flashlights', (req, res) => {
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.flashLights(getToken(req), vehicleid), res);
});

app.post('/api/:vehicleid/setsentrymode', (req, res) => {
    let on = req.body.value;
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.setSentryMode(getToken(req), vehicleid, on), res);
});

app.post('/api/logout', (req, res) => {
    handleSimplePromise(tesla.logout(), res);
});

app.post('/api/:vehicleid/lockdoors', (req, res) => {
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.lockDoors(getToken(req),vehicleid), res);
});

app.post('/api/:vehicleid/unlockdoors', (req, res) => {
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.unlockDoors(getToken(req),vehicleid), res);
});

app.post('/api/:vehicleid/opentrunk', (req, res) => {
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.openTrunk(getToken(req),vehicleid), res);
});

app.post('/api/:vehicleid/openfrunk', (req, res) => {
    let vehicleid = req.params.vehicleid;
    handleSimplePromise(tesla.openFrunk(getToken(req),vehicleid), res);
});

app.listen(PORT, () =>
    logger.log(`Example app listening on port ${PORT}!`),
);

