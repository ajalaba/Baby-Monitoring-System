const dotenv = require('dotenv'); 
const axios = require('axios'); 

dotenv.config();

const { API_URL } = process.env;

test('test device array', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices`)
        .then(resp => resp.data) 
        .then(resp => {
            expect(resp[0].user_name).toEqual('Ben');  
        });
});

test('test get temp data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/temperature`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"temp_date": "Fri Sep 11 2020 00:34:34 GMT+1000 (AEST)", "temp_unit": "F", "temp_value": "42.93647034821688"}); 
        });
});

test('test get sound data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/sound`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"sound_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)", "sound_unit": "dB", "sound_value": "36.08705965185513"}); 
        });
});

test('test get humidity data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/humidity`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"humid_date": "Fri Sep 11 2020 00:34:34 GMT+1000 (AEST)", "humid_unit": "%","humid_value": "0.28358848006047044"}); 
        });
});

test('test get acceleration data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/accelerometer`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"accel_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)", "accel_unit": "m/s^2","accel_value": "88.39288733596999"}); 
        });
});

test('test get infrared data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/infrared`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"ir_date": "Fri Sep 11 2020 00:31:53 GMT+1000 (AEST)","ir_unit": "cm","ir_value": "23.67995884645885"}); 
        });
});

test('test get location data', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f50a23d25bb7a03a4af477e/location`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0]).toEqual({"date": "2015-03-25T12:00:00Z","lat": -37.84674,"lon": 145.115113}); 
        });
});

test('test get user devices', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/users/danny/devices`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0].device_name).toEqual("Device 1"); 
        });
});

test('test get instructions', () => { 
    expect.assertions(1);
    return axios.get(`${API_URL}/devices/5f59d8f328c99530b014f043/instructions`)
        .then(resp => resp.data) 
        .then(resp => {
            //console.log(resp.data);
            expect(resp[0].instruct).toEqual("Hello!"); 
        });
});

test('test registration', async(done) => {
    newUser = {
        name: "danny",
        password : "test123",
        email : "deol.satish.2001.3@gmail.com"
    };
    let res = await axios.post(`${API_URL}/registration`, newUser)
        //console.log(res.data);
        expect(res.data).toBe('Error!!! User already exists');
        done()
});

test('test authenticate', async(done) => {
    User = {
        name: "danny",
        password : "test123"
        
    };
    let res = await axios.post(`${API_URL}/authenticate`, User)
        //console.log(res.data);
        expect(res.data.message).toBe('Authenticated successfully');
        done()
});

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
