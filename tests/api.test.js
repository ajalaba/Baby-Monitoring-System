const dotenv = require('dotenv'); 
const axios = require('axios'); 

dotenv.config();

const { API_URL } = process.env;


/*
Test name : test device array

Test to see if GET device list endpoint returns a username of danny
from the first element in the device array
*/
test('test device array', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices`)
        .then(resp => resp.data) 
        .then(resp => {
            expect(resp[0].user_name).toEqual('danny');  
        });
});


/*
Test name : test get temp data

Test to see if GET temperature endpoint returns a temperature data log of 

"temp_date": "Fri Sep 11 2020 00:34:34 GMT+1000 (AEST)", 
"temp_unit": "F", 
"temp_value": "42.93647034821688"

from device with id 5f59d8f328c99530b014f043
*/
test('test get temp data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/temperature`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"temp_date": "Fri Sep 11 2020 00:34:34 GMT+1000 (AEST)", "temp_unit": "F", "temp_value": "42.93647034821688"}); 
        });
});


/*
Test name : test get sound data

Test to see if GET sound endpoint returns a sound data log of 

"sound_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)", 
"sound_unit": "dB", 
"sound_value": "36.08705965185513"

from device with id 5f59d8f328c99530b014f043
*/
test('test get sound data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/sound`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"sound_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)", "sound_unit": "dB", "sound_value": "36.08705965185513"}); 
        });
});


/*
Test name : test get humidity data

Test to see if GET humidity endpoint returns a humidity data log of 

"humid_date": "Fri Sep 11 2020 00:34:34 GMT+1000 (AEST)", 
"humid_unit": "%",
"humid_value": "0.28358848006047044"

from device with id 5f59d8f328c99530b014f043
*/
test('test get humidity data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/humidity`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"humid_date": "Fri Sep 11 2020 00:34:34 GMT+1000 (AEST)", "humid_unit": "%","humid_value": "0.28358848006047044"}); 
        });
});


/*
Test name : test get acceleration data

Test to see if GET acceleration endpoint returns a acceleration data log of 

"accel_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)", 
"accel_unit": "m/s^2",
"accel_value": "88.39288733596999"

from device with id 5f59d8f328c99530b014f043
*/
test('test get acceleration data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/accelerometer`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"accel_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)", "accel_unit": "m/s^2","accel_value": "88.39288733596999"}); 
        });
});


/*
Test name : test get infrared data

Test to see if GET infrared endpoint returns a infrared data log of 

"ir_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)",
"ir_unit": "cm",
"ir_value": "23.67995884645885"

from device with id 5f59d8f328c99530b014f043
*/
test('test get infrared data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/infrared`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"ir_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)","ir_unit": "cm","ir_value": "23.67995884645885"}); 
        });
});


/*
Test name : test get location data

Test to see if GET location endpoint returns a location data log of 

"date": "2015-03-25T12:00:00Z",
"lat": -37.84674,
"lon": 145.115113

from device with id 5f59d8f328c99530b014f043
*/
test('test get location data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/location`)
        .then(resp => resp.data) 
        .then(resp => {
            console.log(resp.data);
            expect(resp[0]).toEqual({"date": "2015-03-25T12:00:00Z","lat": -37.84674,"lon": 145.115113}); 
        });
});


/*
Test name : test get user devices

Test to see if GET user device list endpoint returns 
the first device (Device 1) for user danny 
*/
test('test get user devices', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/users/danny/devices`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0].device_name).toEqual("Device 1"); 
        });
});


/*
Test name : test get instructions

Test to see if GET instructions endpoint returns 
the first instruction for device with id 5f59d8f328c99530b014f043
*/
test('test get instructions', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/instructions`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0].instruct).toEqual("Hello!"); 
        });
});


/*
Test name : test registration

Test to see if POST registration endpoint registers a device

name: "danny",
password : "test123",
email : "deol.satish.2001.3@gmail.com"

(Note: This is an existing device)

The test should return a message "Error!!! User already exists"
*/
test('test registration', async(done) => {
    newUser = {
        name: "danny",
        password : "test123",
        email : "deol.satish.2001.3@gmail.com"
    };
    let res = await axios.post(`${API_URL}/registration`, newUser)
        console.log(res.data);
        expect(res.data).toBe('Error!!! User already exists');
        done()
});

/*
Test name : test authenticate

Test to see if POST authenticate endpoint authenticates a device

name: "danny",
password : "test123",

(Note: This is an existing device)

The test should return a message "Authenticated successfully"
*/
test('test authenticate', async(done) => {
    User = {
        name: "danny",
        password : "test123"
        
    };
    let res = await axios.post(`${API_URL}/authenticate`, User)
        console.log(res.data);
        expect(res.data.message).toBe('Authenticated successfully');
        done()
});

/*
Test name : test post temperature

Test to see if POST temperature endpoint adds temp data for device 5f59d8f328c99530b014f043

temp_value: "30.7",
temp_unit: "F",
temp_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"

The test should return a message "Saved Sucessfully"
*/
test('test post temperature', async(done) => {
    temp_body = {
        temp_value: "30.7",
        temp_unit: "F",
        temp_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"
        
    };
    let res = await axios.post(`${API_URL}/devices/5f59d8f328c99530b014f043/temperature`, temp_body)
        //console.log(res.data);
        expect(res.data).toBe('Saved Sucessfully');
        done()
});


/*
Test name : test post sound

Test to see if POST sound endpoint adds sound data for device 5f59d8f328c99530b014f043

sound_value: "30.7",
sound_unit: "dB",
sound_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"

The test should return a message "Saved Sucessfully"
*/
test('test post sound', async(done) => {
    sound_body = {
        sound_value: "30.7",
        sound_unit: "dB",
        sound_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"
        
    };
    let res = await axios.post(`${API_URL}/devices/5f59d8f328c99530b014f043/sound`, sound_body)
        //console.log(res.data);
        expect(res.data).toBe('Saved Sucessfully');
        done()
});


/*
Test name : test post humidity

Test to see if POST humidity endpoint adds humidity data for device 5f59d8f328c99530b014f043

humid_value: "30.7",
humid_unit: "%",
humid_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"

The test should return a message "Saved Sucessfully"
*/
test('test post humidity', async(done) => {
    humid_body = {
        humid_value: "30.7",
        humid_unit: "%",
        humid_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"
        
    };
    let res = await axios.post(`${API_URL}/devices/5f59d8f328c99530b014f043/humidity`, humid_body)
        //console.log(res.data);
        expect(res.data).toBe('Saved Sucessfully');
        done()
});


/*
Test name : test post acceleration

Test to see if POST acceleration endpoint adds acceleration data for device 5f59d8f328c99530b014f043

accel_value: "2",
accel_unit: "m/s^2",
accel_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"
        
The test should return a message "Saved Sucessfully"
*/
test('test post acceleration', async(done) => {
    accel_body = {
        accel_value: "2",
        accel_unit: "m/s^2",
        accel_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"
        
    };
    let res = await axios.post(`${API_URL}/devices/5f59d8f328c99530b014f043/accelerometer`, accel_body)
        //console.log(res.data);
        expect(res.data).toBe('Saved Sucessfully');
        done()
});


/*
Test name : test post infrared

Test to see if POST infrared endpoint adds infrared data for device 5f59d8f328c99530b014f043

ir_value: "13",
ir_unit: "unit(s)",
ir_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"

The test should return a message "Saved Sucessfully"
*/
test('test post infrared', async(done) => {
    ir_body = {
        ir_value: "13",
        ir_unit: "unit(s)",
        ir_date: "Tue Sep 29 2020 22:36:20 GMT+1000 (Australian Eastern Standard Time)"
        
    };
    let res = await axios.post(`${API_URL}/devices/5f59d8f328c99530b014f043/infrared`, ir_body)
        //console.log(res.data);
        expect(res.data).toBe('Saved Sucessfully');
        done()
});


/*
Test name : test post location

Test to see if POST location endpoint adds location data for device 5f59d8f328c99530b014f043

date:"2015-03-25T12:00:00Z",
lat : -37.84674, 
lon : 145.115113

The test should return a message "Saved Sucessfully"
*/
test('test post location', async(done) => {
    location_body = {
        date:"2015-03-25T12:00:00Z",
        lat : -37.84674, 
        lon : 145.115113
    };
    let res = await axios.post(`${API_URL}/devices/5f59d8f328c99530b014f043/location`, location_body)
        //console.log(res.data);
        expect(res.data).toBe('Saved Sucessfully');
        done()
});
