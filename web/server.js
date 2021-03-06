const express = require('express');
const app = express();
app.use(express.static('public'));
app.use((req, res, next) => {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
next();
});
const port = process.env.PORT || 3000;
const base = `${__dirname}/public`;
app.use(express.static('public'));


app.listen(port, () => {
    console.log(`listening on port ${port}`);
    });   
app.get('/', function (req, res) {
    res.sendFile(`${base}/get-started.html`);
    });
app.get('/device-list', (req, res) => {
    res.sendFile(`${base}/device-list.html`);
    });
app.get('/register-device', function (req, res) {
    res.sendFile(`${base}/register-device.html`);
    });
app.get('/send-command', (req, res) => {
    res.sendFile(`${base}/send-command.html`);
});
app.get('/login', (req, res) => {
    res.sendFile(`${base}/login.html`);
});
app.get('/registration', (req, res) => {
    res.sendFile(`${base}/registration.html`);
});
app.get('/humid', (req, res) => {
    res.sendFile(`${base}/humid.html`);
});
app.get('/infrared', (req, res) => {
    res.sendFile(`${base}/infrared.html`);
});
app.get('/sound', (req, res) => {
    res.sendFile(`${base}/sound.html`);
});
app.get('/temp', (req, res) => {
    res.sendFile(`${base}/temp.html`);
});
app.get('/accelerometer', (req, res) => {
    res.sendFile(`${base}/accelerometer.html`);
});
app.get('/notifications', (req, res) => {
    res.sendFile(`${base}/notifications.html`);
});
app.get('/maps', (req, res) => {
    res.sendFile(`${base}/maps.html`);
});
app.get('/device-data', (req, res) => {
    res.sendFile(`${base}/device-data.html`);
});
app.get('*', (req, res) => {
    res.sendFile(`${base}/404.html`);
    });
