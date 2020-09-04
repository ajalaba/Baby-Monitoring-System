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
    res.sendFile(`${base}/device-list.html`);
    });

app.get('/register-device', function (req, res) {
    res.sendFile(`${base}/register-device.html`);
    });
app.get('/send-command', (req, res) => {
    res.sendFile(`${base}/send-command.html`);
});
app.get('*', (req, res) => {
    res.sendFile(`${base}/404.html`);
    });
