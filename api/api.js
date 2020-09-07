const mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
mongoose.connect('mongodb+srv://adv:adv123@cluster0.lpmrh.mongodb.net/BabyMonitor');

//mongoose.connect('mongodb+srv://deolsatish:debarati@sit209.udjho.mongodb.net/test1');
// To connect to mongo db dtabase using mongodb shell mongo "mongodb+srv://cluster0.lpmrh.mongodb.net/BabyMonitor>" --username adv



const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const port = process.env.PORT || 5000;

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



/**
* @api {get} /api/test tests if api is working
* @apiGroup Test
* @apiSuccessExample {String} Success-Response:
*"The API is working!"
*/



app.get('/api/test', (req, res) => {
    res.send('The API is working!');
    });
    app.listen(port, () => {
    console.log(`listening on port ${port}`);
    });



const Device = require('./models/device');


app.get('/api/devices', (req, res) => {
    console.log("Entered api/devices");
    console.log(Device);
    Device.find({}, (err, devices) => {
    if (err == true) 
    {
        console.log("adsasd");
        return res.send(err);
    } 
    else 
    {
        console.log("adsasd");
        return res.send(devices);
    }
    });
});
app.post('/api/devices', (req, res) => {
    const { device_name, user_name, sensor_data } = req.body;
    const newDevice = new Device({
    device_name,
    user_name,
    sensor_data
    });
    newDevice.save(err => {
    return err
    ? res.send(err)
    : res.send('successfully added device and data');
    });
});

app.get('/api/devices/:deviceId/device-history', (req, res) => {
    const { deviceId } = req.params;
    console.log(deviceId);
    // to test in the browser http://localhost:5000/api/devices/5f50a23d25bb7a03a4af477e/device-history
    Device.findOne({"_id": deviceId }, (err, devices) => {
    console.log(devices);
    const { sensor_data } = devices;
    console.log(sensor_data);
    return err
    ? res.send(err)
    : res.send(sensor_data);
    });
    });

/**
* @api {post} /api/devices AllDevices Send Command
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
*   { 
*       "Successfully sent command"
*   }
* @apiErrorExample {json} Error-Response: 
*   {
*       "Command does not exist" 
*   }
*/

app.post('/api/send-command', (req, res) => { 
    console.log(req.body);
});
/*
{ 
    "id" : 1,
    "device_name" : "",
    "user_name" : "",
    "sensor_data" : { "acceleration" : { "value" : 7.6, "unit" : "m/s^2"}, "temperature" : {"value" : 36, "unit" : "C"}, "sound" : { "sound_peak_dB" : 64, "sound_avg_dB" : 34}}
}
*/