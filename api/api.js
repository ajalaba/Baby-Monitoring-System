require('dotenv').config();
const mongoose = require('mongoose');
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
mongoose.connect('mongodb+srv://adv:adv123@cluster0.lpmrh.mongodb.net/BabyMonitor', { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

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

/**
* @api {get} /api/devices AllDevices An array of all devices
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
* [
* {
* "_id": "5f50a23d25bb7a03a4af477e",
* "id": "1"
* "device_name": "Device 0",
* "user_name": "Ben",
* "sensorData": {
*   "acceleration": {
*           "unit": "m/s^2",
*           "accel_value": 7.6
*   },
*   "temperature": {
*           "temp value": 36,
*           "unit": "C"
*   },
*    "sound": {
*           "sound_peak_dB": 64,
*           "sound_avg_dB": 34
*   }
* },
* {
*    "accelerometer_data": [
*   {
*        "accel_date": "Fri Sep 11 2020 00:49:32 GMT+1000 (AEST)"
*        "accel_value": "84.94259887402306"
*        "accel_unit": "m/s^2"
*   }
*   ],
*    "humidity_data": [
*   {
*       "humid_date": "Tue Sep 15 2020 21:58:26 GMT+1000 (Australian Eastern Standard Time)",
*       "humid_value": "94.36478930161715",
*       "humid_unit": "%"
*   }
*   ],   
*    "infrared_data": [
*   {
*        "ir_date": "Tue Sep 15 2020 21:34:44 GMT+1000 (Australian Eastern Standard Time)",
*        "ir_value": "41.36774826287564",
*        "ir_unit": "cm"
*   }
*   ],
*    "location_data": [],
*    "sound_data": [
*   {
*        "sound_date": "Tue Sep 15 2020 21:58:26 GMT+1000 (Australian Eastern Standard Time)",
*        "sound_value": "8.678198235045741",
*        "sound_unit": "dB"
*   }
*   ],
*    "temp_data": [
*   {
*        "temp_date": "Wed Sep 16 2020 01:26:05 GMT+1000 (AEST)",
*        "temp_value": "71.86472786382959",
*        "temp_unit": "F"
*   }
*   ],
*    "instructions": [
*   {
*        instruct: "fdasfdwsa"
*   }
*   ]
*   }
*   ]
* @apiErrorExample {json} Error-Response:
* {
* "User does not exist"
* }
*/
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

/**
* @api {post} /api/devices AllDevices An array of all devices
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
*   { successfully added device and data }
* @apiErrorExample {json} Error-Response:
* {
* "User does not exist"
* }
*/  
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
    var set_temp=37;
    const newDevice = new Device({
    device_name,
    user_name,
    patient_name,
    temp_data,
    humidity_data,
    sound_data,
    accelerometer_data,
    infrared_data,
    device_status,
    location_data,
    instructions,
    set_temp
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
* @api {post} /api/send-command AllDevices Send Command
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
* @api {post} /api/devices/:device_id/temperature Inputs Temperature Data
* @apiGroup Devices
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
* @api {get} /api/devices/:device_id/temperature Displays Temperature Data
* @apiGroup Devices
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
* @api {post} /api/devices/:device_id/sound Inputs Sound Data
* @apiGroup Devices
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
* @api {get} /api/devices/:device_id/sound displays sound data
* @apiGroup Devices
* @apiSuccessExample {json} Success-Response:
*
*                    { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit" : "dB"}
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

// { "date":"2015-03-25T12:00:00Z", "lat" : -37.84674, "lon" : 145.115113}

/**
* @api {post} /api/devices/:device_id/location Inputs Location Data
* @apiGroup Devices
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
app.post('/api/devices/:device_id/location', (req, res) => {
    var loc = req.body;
    console.log(loc);
    var { device_id } = req.params;
    Device.findOne({"_id": device_id }, (err, devices) => {
        var {  location_data } = devices;
        location_data.push(loc);
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
* @api {get} /api/devices/:device_id/location Displays Location Data
* @apiGroup Devices
* @apiSuccessExample {json} Success-Response:
*
*                    { "date":"2015-03-25T12:00:00Z", "value" : 46, "value" : 213, "unit" : "latitude", "unit" : "longitude"}
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/
app.get('/api/devices/:device_id/location', (req, res) => {
          
        var { device_id } = req.params;
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  location_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.location_data);
            });
});





/**
* @api {post} /api/devices/:device_id/humidity Inputs Humidity Data
* @apiGroup Devices
* @apiParam {json}:
* { "date":"2015-03-25T12:00:00Z", "value" : 30, "unit": "%"}
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

    /**
* @api {get} /api/devices/:device_id/humidty Displays Humidity Data
* @apiGroup Devices
* @apiSuccessExample {json} Success-Response:
*
*                    { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit" : "%"}
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/
app.get('/api/devices/:device_id/humidity', (req, res) => {
          
        var { device_id } = req.params;
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  humidity_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.humidity_data);
            });
});


/**
* @api {post} /api/devices/:device_id/accelerometer Inputs Accelerometer Data
* @apiGroup Devices
* @apiParam {json}:
* { "date":"2015-03-25T12:00:00Z", "value" : 30, "unit": "m/s^2"}
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

    /**
* @api {get} /api/devices/:device_id/accelerometer Displays accelerometer Data
* @apiGroup Devices
* @apiSuccessExample {json} Success-Response:
*
*                    { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit" : "m/s^2"}
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/
app.get('/api/devices/:device_id/accelerometer', (req, res) => {
          
        var { device_id } = req.params;
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  accelerometer_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.accelerometer_data);
            });
});


/**
* @api {post} /api/devices/:device_id/infrared Inputs infrared Data
* @apiGroup Devices
* @apiParam {json}:
* { "date":"2015-03-25T12:00:00Z", "value" : 30, "unit": "cm"}
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
    /**
* @api {get} /api/devices/:device_id/infrared Displays infrared Data
* @apiGroup Devices
* @apiSuccessExample {json} Success-Response:
*
*                    { "date":"2015-03-25T12:00:00Z", "value" : 46, "unit" : "cm"}
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/
app.get('/api/devices/:device_id/infrared', (req, res) => {
          
        var { device_id } = req.params;
        Device.findOne({"_id": device_id }, (err, devices) => {
            var {  infrared_data } = devices;
            return err
            ? res.send(err)
            : res.send(devices.infrared_data);
            });
});



// app.post('/api/devices/:device_id/notifications', (req, res) => {
//     var noti = req.body;
//     console.log(inf);
    
//     var { device_id } = req.params;
//     Device.findOne({"_id": device_id }, (err, devices) => {
//         var {  notifications_data } = devices;
//         notifications_data.push(noti);
//         console.log("AFter");
//         devices.save(err => {
//             if(err)
//             {
//                 console.log(err);
//             }
//         })
//         return err
//         ? res.send(err)
//         : res.send("Saved Sucessfully");
//         });
//     });
// app.get('/api/devices/:device_id/notifications', (req, res) => {
          
//         var { device_id } = req.params;
//         Device.findOne({"_id": device_id }, (err, devices) => {
//             var {  notifications_data } = devices;
//             return err
//             ? res.send(err)
//             : res.send(devices.notifications_data);
//             });
// });



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
    const { name, password, email_id, isAdmin } = req.body;
    console.log(typeof(email_id));
    var notification_array=[];
    var notification12={
        "title":"Welcome !!",
        "description":"Welcome To Baby Monitoring System"
    };
    notification_array.push(notification12);
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
                isAdmin,
                notification_array,
                email_id
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
* @api {get} /api/users/:user/notifications Displays Notifications 
* @apiGroup Users
* @apiSuccessExample {json} Success-Response:
*
*                    { "Notification result"}
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error:(User doesn't exist)The User in not in the Registration Database"
*}
*/
app.get('/api/users/:user/notifications', (req, res) => {
    const { user } = req.params;
    User.findOne({"name":user}, (err, result1) => {
        if(err)
        return err;
        console.log("Result");
        console.log(result1);
        if(result1==null)
        {
            res.send("Error:(User doesn't exist)The User in not in the Registration Database");
        }
        else
        {
            res.send(result1.notification_array);
        }
    });
});


// {
//     "title": "Baby Monitor Notifications",
//     "description": " Is this woaasd?"
// }



/**
* @api {post} /api/users/:user/notifications Inputs Notifications
* @apiGroup Users
* @apiParam {json}:
* @apiSuccessExample {String} Success-Response:
*                    {
*                        "Saved Sucessfully"
*                    }
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error:(User doesn't exist)The User in not in the Registration Database"
*}
*/
app.post('/api/users/:user/notifications', (req, res) => {
    const { user } = req.params;
    var nt=req.body;
    User.findOne({"name":user}, (err, result1) => {
        if(err)
        return err;
        console.log("Result");
        console.log(result1);
        var{ notification_array }=result1;
        notification_array.push(nt);
        result1.save(err => {
            if(err)
            {
                console.log(err);
            }
        })
        if(result1==null)
        {
            res.send("Error:(User doesn't exist)The User in not in the Registration Database");
        }
        else
        {
            res.send("Saved Successfully");
        }
    });
});


/**
* @api {post} /api/users/:user/deletenotifications Deletes Notifications
* @apiGroup Users
* @apiParam {json}:
* @apiSuccessExample {String} Success-Response:
*                    {
*                        "Saved Sucessfully"
*                    }
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error:(User doesn't exist)The User in not in the Registration Database"
*}
*/
app.post('/api/users/:user/deletenotifications', (req, res) => {
    const { user } = req.params;
    console.log("Entered delete notifications");
    var {index}=req.body;
    console.log(index);
    User.findOne({"name":user}, (err, result1) => {
        if(err)
        return err;
        console.log("Result");
        
        var{ notification_array }=result1;
        notification_array.splice(0,1);
        //notification_array.pop({});
        console.log(notification_array);
        result1.save(err => {
            if(err)
            {
                console.log(err);
            }
        })
        if(result1==null)
        {
            res.send("Error:(User doesn't exist)The User in not in the Registration Database");
        }
        else
        {
            res.send("Saved Successfully");
        }
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


/**
* @api {post} /api/devices/:device_id/instructions Inputs Instructions
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
*                    { "Added instruction" }
*                    { "Saved Successfully" }
*                    
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/
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

/**
* @api {post} /api/devices/:device_id/instructions Inputs Instructions
* @apiGroup Device
* @apiSuccessExample {json} Success-Response:
*                    { "instruct": "afdfs" }               
* @apiErrorExample {String} Error-Response:
*{
*                       "Error"
*}
*/
app.get('/api/devices/:device_id/instructions', (req, res) => {
          
    var { device_id } = req.params;
    Device.findOne({"_id": device_id }, (err, devices) => {
        return err
        ? res.send(err)
        : res.send(devices.instructions);
        });
});
//This has an error




