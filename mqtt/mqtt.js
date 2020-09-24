const sound_high=27;
const sound_low=37;
const humidity_high=37;
const humidity_low=37;
const infrared_high=37;
const infrared_low=37;
const accelerometer_high=37;
const accelerometer_low=37;
const temperature_high=37;
const temperature_low=37;




require('dotenv').config();

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );

const mqtt = require('mqtt');
const express = require('express');
const rand = require('random-int');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'deol.satish.2001.3@gmail.com',
      pass: 'chaitra381920181'
    }
  });
// var testAccount = nodemailer.createTestAccount();
// let transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: testAccount.user, // generated ethereal user
//       pass: testAccount.pass, // generated ethereal password
//     },
//   });


const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const bodyParser = require('body-parser'); 
const app = express();
const port = process.env.PORT || 5001;

app.use(bodyParser.json()); 

app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(express.static('public'));
app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next();
});


const Device = require('./models/device');
const User = require('./models/user');
const API_URL = 'http://localhost:5000/api';
const MQTT_URL = 'http://127.0.0.1:5001';

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
var cmd;
var device_name;

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

client.on('connect', () => { 
    console.log('mqtt connected');
    client.subscribe('/soundData');
    client.subscribe('/tempData');
    client.subscribe('/humidData');
    client.subscribe('/accelData');
    client.subscribe('/irData');
    //client.subscribe('/command/#');
});

client.on('message', (topic, message) => { 
    const data = JSON.parse(message);

    Device.findOne({"device_name": data.device_name }, (err, devices) => { 
                
        if (topic == '/soundData') {
                
                    if (err) {
                        console.log(err) 
                    }
                    const { sound_body } = data;

                    if(sound_body.sound_value>sound_high)
                    {
                        console.log(sound_body.sound_value);
                        User.findOne({"name":devices.user_name},(err,user) => {
                            if(err) return err;
                            var {notification_array} =user;
                            var s="At time: ";
                            var s1=sound_body.sound_date;
                            console.log(sound_body.sound_date);
                            var s2=" the sound level increased beyond the recommended threshold to ";
                            var s3= String(sound_body.sound_value);
                            var title ="Alert :Sound Level increased beyond recommended value ";
                            var description=s+s1+s2+s3;
                            var notification={"title":title, "description":description};
                            console.log(notification);
                            notification_array.push(notification);
                            if(user.email_id!="" || typeof(user.email_id)!=undefined)
                            {
                                console.log("Email Id");
                                console.log(user.email_id);
                                var mailOptions = {
                                    from: 'babymonitorsystem@adv.com',
                                    to: String(user.email_id),
                                    subject: title,
                                    text: description
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                            }
                            user.save(err => {
                                if(err)
                                {
                                    console.log(err);
                                }
                            });

                        });

                    }
        
                    //console.log(devices);
                    var {  sound_data } = devices;
        
                    sound_data.push(sound_body);
        
                    devices.save(err => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
                    
                
        }

        if (topic == '/tempData') {
                
                    if (err) {
                        console.log(err) 
                    }
                    const { temp_body } = data;
                    if(temp_body.temp_value>temperature_high)
                    {
                        console.log(temp_body.temp_value);
                        User.findOne({"name":devices.user_name},(err,user) => {
                            if(err) return err;
                            var {notification_array} =user;
                            var s="At time: ";
                            var s1=temp_body.temp_date;
                            console.log(temp_body.temp_date);
                            var s2=" the temperature level increased beyond the recommended threshold to ";
                            var s3= String(temp_body.temp_value);
                            var title ="Alert :temperature Level increased beyond recommended value ";
                            var description=s+s1+s2+s3;
                            var notification={"title":title, "description":description};
                            console.log(notification);
                            notification_array.push(notification);
                            if(user.email_id!="" || typeof(user.email_id)!=undefined)
                            {
                                var mailOptions = {
                                    from: 'deol.satish.2001.3@gmail.com',
                                    to: String(user.email_id),
                                    subject: title,
                                    text: description
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                            }
                            user.save(err => {
                                if(err)
                                {
                                    console.log(err);
                                }
                            });

                        });
                    }
                    if(temp_body.temp_value<temperature_low)
                    {
                        console.log(temp_body.temp_value);
                        User.findOne({"name":devices.user_name},(err,user) => {
                            if(err) return err;
                            var {notification_array} =user;
                            var s="At time: ";
                            var s1=temp_body.temp_date;
                            console.log(temp_body.temp_date);
                            var s2=" the temperature level decreased beyond the recommended threshold to ";
                            var s3= String(temp_body.temp_value);
                            var title ="Alert :temperature Level decreased beyond recommended value ";
                            var description=s+s1+s2+s3;
                            var notification={"title":title, "description":description};
                            console.log(notification);
                            notification_array.push(notification);
                            if(user.email_id!="" || typeof(user.email_id)!=undefined)
                            {
                                var mailOptions = {
                                    from: 'deol.satish.2001.3@gmail.com',
                                    to: String(user.email_id),
                                    subject: title,
                                    text: description
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                            }
                            user.save(err => {
                                if(err)
                                {
                                    console.log(err);
                                }
                            });

                        });
                    }
        
                    //console.log(devices);
        
                    var {  temp_data } = devices;
                    
        
                    temp_data.push(temp_body);
        
                    devices.save(err => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
                    
        } 
        
        if (topic == '/humidData') {
                
                    if (err) {
                        console.log(err) 
                    }
                    const { humid_body } = data;
                    if(humid_body.humid_value>humidity_high)
                    {
                        console.log(humid_body.humid_value);
                        User.findOne({"name":devices.user_name},(err,user) => {
                            if(err) return err;
                            var {notification_array} =user;
                            var s="At time: ";
                            var s1=humid_body.humid_date;
                            console.log(humid_body.humid_date);
                            var s2=" the humidity level increased beyond the recommended threshold to ";
                            var s3= String(humid_body.humid_value);
                            var title ="Alert :humidity Level increased beyond recommended value ";
                            var description=s+s1+s2+s3;
                            var notification={"title":title, "description":description};
                            console.log(notification);
                            notification_array.push(notification);
                            if(user.email_id!="" || typeof(user.email_id)!=undefined)
                            {
                                var mailOptions = {
                                    from: 'deol.satish.2001.3@gmail.com',
                                    to: String(user.email_id),
                                    subject: title,
                                    text: description
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                            }
                            user.save(err => {
                                if(err)
                                {
                                    console.log(err);
                                }
                            });

                        });
                    }
                    if(humid_body.temp_value<humidity_low)
                    {
                        console.log(humid_body.humid_value);
                        User.findOne({"name":devices.user_name},(err,user) => {
                            if(err) return err;
                            var {notification_array} =user;
                            var s="At time: ";
                            var s1=humid_body.humid_date;
                            console.log(humid_body.humid_date);
                            var s2=" the humidity level decreased beyond the recommended threshold to ";
                            var s3= String(humid_body.humid_value);
                            var title ="Alert :humidity Level decreased beyond recommended value ";
                            var description=s+s1+s2+s3;
                            var notification={"title":title, "description":description};
                            console.log(notification);
                            notification_array.push(notification);
                            if(user.email_id!="" || typeof(user.email_id)!=undefined)
                            {
                                var mailOptions = {
                                    from: 'deol.satish.2001.3@gmail.com',
                                    to: String(user.email_id),
                                    subject: title,
                                    text: description
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                            }
                            user.save(err => {
                                if(err)
                                {
                                    console.log(err);
                                }
                            });

                        });
                    }
                    
        
                    var {  humidity_data } = devices;
        
                    humidity_data.push(humid_body);
        
                    devices.save(err => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
        } 
        
        if (topic == '/accelData') {
                
                    if (err) {
                        console.log(err) 
                    }
                    const { accel_body } = data;
                    if(accel_body.accel_value>accelerometer_high)
                    {
                        console.log(accel_body.accel_value);
                        User.findOne({"name":devices.user_name},(err,user) => {
                            if(err) return err;
                            var {notification_array} =user;
                            var s="At time: ";
                            var s1=accel_body.accel_date;
                            console.log(accel_body.accel_date);
                            var s2=" the accelerometer level increased beyond the recommended threshold to ";
                            var s3= String(accel_body.accel_value);
                            var title ="Alert :accelerometer Level increased beyond recommended value ";
                            var description=s+s1+s2+s3;
                            var notification={"title":title, "description":description};
                            console.log(notification);
                            notification_array.push(notification);
                            if(user.email_id!="" || typeof(user.email_id)!=undefined)
                            {
                                var mailOptions = {
                                    from: 'deol.satish.2001.3@gmail.com',
                                    to: String(user.email_id),
                                    subject: title,
                                    text: description
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                            }
                            user.save(err => {
                                if(err)
                                {
                                    console.log(err);
                                }
                            });

                        });
                    }
                    // if(accel_body.temp_value<accelerometer_low)
                    // {
                    //     console.log(accel_body.accel_value);
                    //     User.findOne({"name":devices.user_name},(err,user) => {
                    //         if(err) return err;
                    //         var {notification_array} =user;
                    //         var s="At time: ";
                    //         var s1=accel_body.accel_date;
                    //         console.log(accel_body.accel_date);
                    //         var s2=" the humidity level decreased beyond the recommended threshold to ";
                    //         var s3= String(accel_body.accel_value);
                    //         var title ="Alert :humidity Level decreased beyond recommended value ";
                    //         var description=s+s1+s2+s3;
                    //         var notification={"title":title, "description":description};
                    //         console.log(notification);
                    //         notification_array.push(notification);
                    //         if(user.email_id!="" || typeof(user.email_id)!=undefined)
                    //         {
                    //             var mailOptions = {
                    //                 from: 'deol.satish.2001.3@gmail.com',
                    //                 to: 'deol.satish@outlook.com',
                    //                 subject: title,
                    //                 text: description
                    //               };
                                  
                    //               transporter.sendMail(mailOptions, function(error, info){
                    //                 if (error) {
                    //                   console.log(error);
                    //                 } else {
                    //                   console.log('Email sent: ' + info.response);
                    //                 }
                    //               });
                    //         }
                    //         user.save(err => {
                    //             if(err)
                    //             {
                    //                 console.log(err);
                    //             }
                    //         });

                    //     });
                    // }
        
                    var {  accelerometer_data } = devices;
        
                    accelerometer_data.push(accel_body);
        
                    devices.save(err => {
                        if(err)
                        {
                        
                            console.log(err);
                        }
                    });
        } 
        
        if (topic == '/irData') {
                    
                    if (err) {
                        console.log(err) 
                    }
                    const { ir_body } = data;
                    if(ir_body.ir_value>humidity_high)
                    {
                        console.log(ir_body.ir_value);
                        User.findOne({"name":devices.user_name},(err,user) => {
                            if(err) return err;
                            var {notification_array} =user;
                            var s="At time: ";
                            var s1=ir_body.ir_date;
                            console.log(ir_body.ir_date);
                            var s2=" the Infrared level increased beyond the recommended threshold to ";
                            var s3= String(ir_body.ir_value);
                            var title ="Alert :Infrared Level increased beyond recommended value ";
                            var description=s+s1+s2+s3;
                            var notification={"title":title, "description":description};
                            console.log(notification);
                            notification_array.push(notification);
                            if(user.email_id!="" || typeof(user.email_id)!=undefined)
                            {
                                var mailOptions = {
                                    from: 'deol.satish.2001.3@gmail.com',
                                    to: String(user.email_id),
                                    subject: title,
                                    text: description
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                            }
                            user.save(err => {
                                if(err)
                                {
                                    console.log(err);
                                }
                            });

                        });
                    }
                    if(ir_body.ir_value<humidity_low)
                    {
                        console.log(ir_body.ir_value);
                        User.findOne({"name":devices.user_name},(err,user) => {
                            if(err) return err;
                            var {notification_array} =user;
                            var s="At time: ";
                            var s1=ir_body.ir_date;
                            console.log(ir_body.ir_date);
                            var s2=" the Infrared level decreased beyond the recommended threshold to ";
                            var s3= String(ir_body.ir_value);
                            var title ="Alert :Infrared Level decreased beyond recommended value ";
                            var description=s+s1+s2+s3;
                            var notification={"title":title, "description":description};
                            console.log(notification);
                            notification_array.push(notification);
                            if(user.email_id!="" || typeof(user.email_id)!=undefined)
                            {
                                var mailOptions = {
                                    from: 'deol.satish.2001.3@gmail.com',
                                    to: String(user.email_id),
                                    subject: title,
                                    text: description
                                  };
                                  
                                  transporter.sendMail(mailOptions, function(error, info){
                                    if (error) {
                                      console.log(error);
                                    } else {
                                      console.log('Email sent: ' + info.response);
                                    }
                                  });
                            }
                            user.save(err => {
                                if(err)
                                {
                                    console.log(err);
                                }
                            });

                        });
                    }
        
                    var {  infrared_data } = devices;
        
                    infrared_data.push(ir_body);
        
                    devices.save(err => {
                        if(err)
                        {
                            console.log(err);
                        }
                    });
                    
        } 
                
    });

    // if (topic == '/soundData') {
    //     const data = JSON.parse(message);

    //     Device.findOne({"device_name": data.device_name }, (err, devices) => { 
    //         if (err) {
    //             console.log(err) 
    //         }
    //         const { sound_body } = data;

    //         console.log(devices);
    //         var {  sound_data } = devices;

    //         sound_data.push(sound_body);

    //         devices.save(err => {
    //             if(err)
    //             {
    //                 console.log(err);
    //             }
    //         });
            
    //     });
    // } 

    // else if (topic == '/tempData') {
    //     const data = JSON.parse(message);

    //     Device.findOne({"device_name": data.deviceId }, (err, devices) => { 
    //         if (err) {
    //             console.log(err) 
    //         }
    //         const { temp_body } = data;

    //         console.log(devices);

    //         var {  temp_data } = devices;
            

    //         temp_data.push(temp_body);

    //         devices.save(err => {
    //             if(err)
    //             {
    //                 console.log(err);
    //             }
    //         });
            
    //     });
    // } 

    // else if (topic == '/humidData') {
    //     const data = JSON.parse(message);

    //     Device.findOne({"device_name": data.deviceId }, (err, devices) => { 
    //         if (err) {
    //             console.log(err) 
    //         }
    //         const { humid_body } = data;

    //         var {  humidity_data } = devices;

    //         humidity_data.push(humid_body);

    //         devices.save(err => {
    //             if(err)
    //             {
    //                 console.log(err);
    //             }
    //         });
            
    //     });
    // } 

    // else if (topic == '/accelData') {
    //     const data = JSON.parse(message);

    //     Device.findOne({"device_name": data.deviceId }, (err, devices) => { 
    //         if (err) {
    //             console.log(err) 
    //         }
    //         const { accel_body } = data;

    //         var {  accelerometer_data } = devices;

    //         accelerometer_data.push(accel_body);

    //         devices.save(err => {
    //             if(err)
    //             {
                
    //                 console.log(err);
    //             }
    //         });
            
    //     });
    // } 

    // else if (topic == '/irData') {
    //     const data = JSON.parse(message);

    //     Device.findOne({"device_name": data.deviceId }, (err, ir_devices) => { 
            
    //         if (err) {
    //             console.log(err) 
    //         }
    //         const { ir_body } = data;

    //         var {  infrared_data } = ir_devices;

    //         infrared_data.push(ir_body);

    //         devices.save(err => {
    //             if(err)
    //             {
    //                 console.log(err);
    //             }
    //         });
            
    //     });
    // } 

}); 
const n = 4;

app.post('/send-command', (req, res) => { 
    const { deviceId, command } = req.body; 
    cmd = command;
    device_name = deviceId;
    const topic = `/command/${device_name}`; 
    client.publish(topic, device_name, command, () => {
        res.send('published new message'); 
    });

    if (cmd == "Sound On")
    {
        console.log("Before Sound FOR");
        for (i=0; i < n;i++)
        {
            $.post(`${MQTT_URL}/sound-data`, { });
        }
        console.log("After FOR");
    }
    else if (cmd == "Sound Off")
    {
        console.log("Turned Sound Sensor off");

    }
    
    else if (cmd == "Temp On")
    {
        console.log("Before Temp FOR");
        for (i=0; i < n;i++)
        {
            $.post(`${MQTT_URL}/temp-data`, { });
        }
        console.log("After FOR");
    }
    else if (cmd == "Temp Off")
    {
        console.log("Turned Temp Sensor off");

    }
    
    if (cmd == "Humid On")
    {
        console.log("Before Humid FOR");
        for (i=0; i < n;i++)
        {
            $.post(`${MQTT_URL}/humid-data`, { });
        }
        console.log("After FOR");
    }
    else if (cmd == "Humid Off")
    {
        console.log("Turned Humid Sensor off");

    }

    if (cmd == "Accel On")
    {
        console.log("Before Accel FOR");
        for (i=0; i < n;i++)
        {
            $.post(`${MQTT_URL}/accel-data`, { });
        }
        console.log("After FOR");
    }
    else if (cmd == "Accel Off")
    {
        console.log("Turned Accel Sensor off");

    }
    
    if (cmd == "IR On")
    {
        console.log("Before IR FOR");
        for (i=0; i < n;i++)
        {
            $.post(`${MQTT_URL}/ir-data`, { });
        }
        console.log("After FOR");
    }
    else if (cmd == "IR Off")
    {
        console.log("Turned IR Sensor off");

    }
    
     



});


const time = 3000;

app.post('/sound-data', (req, res) => { 
    //const { deviceId } = req.body;

    // if (cmd == "Sound On")
    // {
    //     for (i=0; i < n;i++)
    //     {
            const sound_date = Date();
            const sound_value = rand(0,150); //Baby crying sound is around 130dB
            const sound_unit = "dB";

            sound_body = {
                sound_date,sound_value,sound_unit
            }

            const topic = '/soundData';
            const message = JSON.stringify({ device_name, sound_body });


            client.publish(topic, message, () => { 
                res.send('published new message');
            }); 
            
            
            sleep(time);
        //}
        
        
    //}
    
});


app.post('/temp-data', (req, res) => { 
    //const { deviceId } = req.body;

    
        
            const temp_date = Date();
            const temp_value = rand(50,110); //min temp = 50; max temp = 110
            const temp_unit = "F";

            temp_body = {
                temp_date,temp_value,temp_unit
            }

            const topic = '/tempData';
            const message = JSON.stringify({ device_name, temp_body });

            client.publish(topic, message, () => { 
                res.send('published new message');
            }); 
            sleep(time);
        
    
    
});

app.post('/humid-data', (req, res) => { 
    //const { deviceId } = req.body;

    
            const humid_date = Date();
            const humid_value = rand(20,60); //Humidity % recommended = 30-50
            const humid_unit = "%";
    
            humid_body = {
                humid_date,humid_value,humid_unit
            }
    
            const topic = '/humidData';
            const message = JSON.stringify({ device_name, humid_body });
    
            client.publish(topic, message, () => { 
                res.send('published new message');
            }); 
            sleep(time);
        

});

app.post('/accel-data', (req, res) => { 
    //const { deviceId } = req.body;

    
            const accel_date = Date();
            const accel_value = Math.random() * Math.floor(2); //Average walking acceleration = 0.7 sth - 1.8 sth
            const accel_unit = "m/s^2";
    
            accel_body = {
                accel_date,accel_value,accel_unit
            }
    
            const topic = '/accelData';
            const message = JSON.stringify({ device_name, accel_body });
    
            client.publish(topic, message, () => { 
                res.send('published new message');
            }); 
            sleep(time);
    
});

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}


app.post('/ir-data', (req, res) => { 
    //const { deviceId } = req.body;
    

   
            const ir_date = Date();
            const ir_value = rand(0,15);//getRandomInt(2); //0 or 1?
            const ir_unit = "unit(s)";
    
            ir_body = {
                ir_date,ir_value,ir_unit
            }
    
            const topic = '/irData';
            const message = JSON.stringify({ device_name, ir_body });
    
            client.publish(topic, message, () => { 
                res.send('published new message');
            }); 
            sleep(time);
       
});

app.listen(port, () => { 
    console.log(`listening on port ${port}`);
});

