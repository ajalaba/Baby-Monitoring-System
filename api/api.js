const mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
//mongoose.connect('mongodb+srv://adv:adv@cluster0.lpmrh.mongodb.net/BabyMonitor?retryWrites=true&w=majority');
mongoose.connect('mongodb+srv://adv:adv123@cluster0.lpmrh.mongodb.net/BabyMonitor', { useNewUrlParser: true, useUnifiedTopology: true });

//mongoose.connect('mongodb+srv://deolsatish:debarati@sit209.udjho.mongodb.net/test1');
// To connect to mongo db dtabase using mongodb shell mongo "mongodb+srv://cluster0.lpmrh.mongodb.net/BabyMonitor>" --username adv

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

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
const device = require('./models/device');
const User = require('./models/user');


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
    const { device_name, user_name, patient_name } = req.body;
    var device_status= 1;
    var location_data= [];
    var temp_data=[];
    var humidity_data=[];
    var sound_data=[];
    var accelerometer_data=[];
    var infrared_data=[];
    var instructions=[];
    const newDevice = new Device({
    device_name,
    user_name,
    patient_name,
    temp_data,
    device_status,
    location_data
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


    app.get('/api/devices/:device_name/device-history', (req, res) => {
        const { device_name } = req.params;
        console.log(device_name);
        // to test in the browser http://localhost:5000/api/devices/5f50a23d25bb7a03a4af477e/device-history
        Device.findOne({"device_name": device_name }, (err, devices) => {
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


// { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit" : "F"}

/**
* @api {post} /api/devices/:device_name/temperature inputs temperature data
* @apiGroup Users
* @apiParam {json}:
* { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit" : "F"}
* @apiSuccessExample {String} Success-Response:
*                    {
*                        "Saved Sucessfully"
*                    }
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/

app.post('/api/devices/:device_id/temperature', (req, res) => {
    var temp = req.body;
    console.log(temp);
    var d = new Date(temp.date);
    console.log(d.toString());
    var { device_id } = req.params;
    Device.findOne({"_id": device_id }, (err, devices) => {
        var {  temp_data } = devices;
        temp_data.push(temp);
        devices.save(err => {
            if(err)
            {
                console.log(err);
            }
        });
        return err
        ? res.send(err)
        : res.send("Saved Sucessfully");
        });
    });

/**
* @api {get} /api/devices/:device_name/temperature displays temperature data
* @apiGroup Users
* @apiSuccessExample {json} Success-Response:
*                    { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit" : "F"}
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/
app.get('/api/devices/:device_id/temperature', (req, res) => {
          
        var { device_id } = req.params;
        
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  temp_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.temp_data);
            });
});

// { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit": "dB"}

/**
* @api {post} /api/devices/:device_name/sound inputs sound data
* @apiGroup Users
* @apiParam {json}:
* { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit": "dB"}
* @apiSuccessExample {String} Success-Response:
*                    {
*                        "Saved Sucessfully"
*                    }
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/

app.post('/api/devices/:device_id/sound', (req, res) => {
    var sound = req.body;
    console.log(sound);
    
    var { device_id } = req.params;
    Device.findOne({"_id": device_id }, (err, devices) => {
        var {  sound_data } = devices;
        sound_data.push(sound);
        console.log("AFter");
        devices.save(err => {
            if(err)
            {
                console.log(err);
            }
        })
        return err
        ? res.send(err)
        : res.send("Saved Sucessfully");
        });
    });
/**
* @api {get} /api/devices/:device_name/sound displays sound data
* @apiGroup Users
* @apiSuccessExample {json} Success-Response:
*                    { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit" : "F"}
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/
app.get('/api/devices/:device_id/sound', (req, res) => {
          
        var { device_id } = req.params;
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  sound_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.sound_data);
            });
});


/**
* @api {post} /api/devices/:device_name/sound inputs sound data
* @apiGroup Users
* @apiParam {json}:
* { "date":"2015-03-25T12:00:00Z", "value" : 20, "unit": "dB"}
* @apiSuccessExample {String} Success-Response:
*                    {
*                        "Saved Sucessfully"
*                    }
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/


app.post('/api/devices/:device_id/humidity', (req, res) => {
    var humid = req.body;
    console.log(humid);
    
    var { device_id } = req.params;
    Device.findOne({"_id": device_id }, (err, devices) => {
        var {  humidity_data } = devices;
        humidity_data.push(humid);
        console.log("AFter");
        devices.save(err => {
            if(err)
            {
                console.log(err);
            }
        })
        return err
        ? res.send(err)
        : res.send("Saved Sucessfully");
        });
    });
app.get('/api/devices/:device_id/humidity', (req, res) => {
          
        var { device_id } = req.params;
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  humidity_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.humidity_data);
            });
});



app.post('/api/devices/:device_id/accelerometer', (req, res) => {
    var acc = req.body;
    console.log(acc);
    
    var { device_id } = req.params;
    Device.findOne({"_id": device_id }, (err, devices) => {
        var {  accelerometer_data } = devices;
        accelerometer_data.push(acc);
        console.log("AFter");
        devices.save(err => {
            if(err)
            {
                console.log(err);
            }
        })
        return err
        ? res.send(err)
        : res.send("Saved Sucessfully");
        });
    });
app.get('/api/devices/:device_id/accelerometer', (req, res) => {
          
        var { device_id } = req.params;
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  accelerometer_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.accelerometer_data);
            });
});



app.post('/api/devices/:device_id/infrared', (req, res) => {
    var inf = req.body;
    console.log(inf);
    
    var { device_id } = req.params;
    Device.findOne({"_id": device_id }, (err, devices) => {
        var {  infrared_data } = devices;
        infrared_data.push(inf);
        console.log("AFter");
        devices.save(err => {
            if(err)
            {
                console.log(err);
            }
        })
        return err
        ? res.send(err)
        : res.send("Saved Sucessfully");
        });
    });
app.get('/api/devices/:device_id/infrared', (req, res) => {
          
        var { device_id } = req.params;
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  infrared_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.infrared_data);
            });
});



/**
* @api {post} /api/registration Adds new Users
* @apiGroup Users
* @apiParam {json}:
* {
*    "name": "Mary's iPhone",
*    "password": test123",
*    "isAdmin":0
*        
*}
* @apiSuccessExample {String} Success-Response:
*"Created new user" 
* @apiErrorExample {String} Error-Response:
*"Error!!! User already exists"
*/

app.post('/api/registration', (req, res) => {
    const { name, password, isAdmin } = req.body;
    User.find({}, (err, users) => {
        console.log("users");
        console.log(users);
    });
    User.findOne({"name":name}, (err, result) => {
        if(err)
        return err;
        console.log("Result");
        console.log(result);
        if(result!=null)
        {
            res.send("Error!!! User already exists");
        }
        else
        {
            const newUser = new User({
                name: name,
                password,
                isAdmin
            });
            newUser.save(err => {
                return err
                ? res.send(err)
                : res.json({
                success: true,
                message: 'Created new user'
                });
            });
        }
    });
});

/**
* @api {get} /api/users/:user/devices Returns device for specific user
* @apiGroup User
* @apiSuccessExample {String} Success-Response:
* [
*    {
*        "_id": "dsohsdohsdofhsofhosfhsofh",
*        "name": "Mary's iPhone",
*        "user": "mary",
*        "sensorData": [
*            {
*                "ts": "1529542230",
*                "temp": 12,
*                "loc": 
*                {
*                    "lat": -37.84674,
*                    "lon": 145.115113
*                }
*            },
*            {
*                "ts": "1529572230",
*                "temp": 17,
*                "loc": 
*                {
*                    "lat": -37.850026,
*                    "lon": 145.117683
*                }
*            }
*        ]
*    }
*] 
* @apiErrorExample {json} Error-Response:
{
    "Device does not exist"
}
*/
app.get('/api/users/:user/devices', (req, res) => {
    const { user } = req.params;
    Device.find({ "user_name": user }, (err, devices) => {
    return err
    ? res.send(err)
    : res.send(devices);
    });
});


/**
* @api {post} /api/authenticate Verifies User
* @apiGroup Users
* @apiParam {json}:
* {
*    "name": "Mary's iPhone",
*    "password": test123"
*        
*}
* @apiSuccessExample {json} Success-Response:{
*                    success: true,
*                    message: 'Authenticated successfully',
*                    isAdmin: result.isAdmin} 
* @apiErrorExample {String} Error-Response:
*Error:(User doesn't exist)The User in not in the Registration Database
*/




app.post('/api/authenticate', (req, res) => {
    const { name, password} = req.body;
    console.log("suthenticate name:"+name);
    console.log("authenticate password:"+password);
    User.findOne({"name":name}, (err, result) => {
        if(err)
        return err;
        console.log("Result");
        console.log(result);
        if(result==null)
        {
            res.send("Error:(User doesn't exist)The User in not in the Registration Database");
        }
        else
        {
            if(result.password==password)
            {
                console.log("password else");
                return res.json({
                    success: true,
                    message: 'Authenticated successfully',
                    isAdmin: result.isAdmin}
                );                
            }
            else
            {
                res.send("Error: Password is incorrect");
            }
        }
    });
});

app.post('/api/devices/:device_id/instructions', (req, res) => { 
    
    var instrct = req.body;
    console.log(instrct);
    var {device_id} = req.params;

    
    Device.findOne({"_id": device_id }, (err, devices) => {

        var {  instructions } = devices;
        instructions.push(instrct);
        console.log("Added instruction");
        devices.save(err => {
            if(err)
            {
                console.log(err);
            }
        })
        return err
        ? res.send(err)
        : res.send("Saved Sucessfully");
        });
    
});

//This has an error
app.get('/api/devices/:device_id/instructions', (req, res) => {
    var { device_id } = req.params;
    Device.find({ "_id": device_id }, (err, devices) => {
    var {  instructions } = devices;
    return err
    ? res.send(err)
    : res.send(devices.instructions);
    });
});
    
