const logger = require('./logger.js');
const tesla = require('./tesla.js');
const express = require('express');
var bodyParser = require("body-parser");
const app = express();

//let PORT = process.env.PORT;
let PORT = 3000;

function getToken(req) {
    let prefix='Bearer ';
    let t = req.get('authorization');
    if (!t) { return false;}
    if (t.indexOf(prefix) == 0) {
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

app.get('/api/getinfo', (req, res) => {
    tesla.getVehicles(getToken(req))
        .then(() => {
            handleSimplePromise(tesla.getVehicleData(getToken(req), 0), res);
        })
        .catch(data => {
            res.status(500).send({success: false, data : data});
        });
});

app.post('/api/wakeup', (req, res) => {
    handleSimplePromise(tesla.wakeUp(getToken(req), 0), res);
});

app.post('/api/logout', (req, res) => {
    handleSimplePromise(tesla.logout(getToken(req)), res);
});

app.listen(PORT, () =>
    logger.log(`Example app listening on port ${PORT}!`),
);
