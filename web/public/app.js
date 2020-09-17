$('#navbar').load('navbar.html');
$('#footbar').load('footer.html');

// const API_URL = 'https://api-theta-nine.vercel.app/api/';
const API_URL = 'http://localhost:5000/api';
const MQTT_URL = `http://localhost:5001`;

const response = $.get(`${API_URL}/devices`);

const isAuthenticated=JSON.parse(localStorage.getItem('isAuthenticated')) || false;
const currentUser = localStorage.getItem('user');
var sesnorData;
var currentDevice;
var deviceName;
var temp;
var deviceId;

        if (currentUser) 
        {
            $.get(`${API_URL}/users/${currentUser}/devices`)
            .then(response => {response.forEach((device) => {
            console.log("'#devices tbody'");
            currentDevice = device;
            deviceName = currentDevice.device_name;
            
            $('#devices tbody').append(`
            <tr data-device-id=${device._id}>
            <td>${device.user_name}</td>
            <td>${device.device_name}</td>
            <td> 
                <button class=\"sound\">Sound</button> 
                <button class=\"temp\">Temp</button> 
                <button class=\"infrared\">IR</button> 
                <button class=\"accelerometer\">Accel</button> 
                <button class=\"humid\">Humid</button> 
            </td>
            <td>
                <div class="form-group"> 
                <input type="text" id="instruct" name="instruct" size="15">
                <button id="add">Add</button>
                </div>
                
            </td>
            <td> 
                <button id="view">View</button> 
            </td>
            </tr>`
            );

            // <td><label for="devices">Choose a Sensor: </label>
            // <select name="forma" onchange="location = this.value;"> 
            //     <option value="">Select Option</option> 
            //     <option value="/sound">Sound</option> 
            //     <option value="/temp">Temperature</option> 
            //     <option value="/accelerometer">Accelerometer</option> 
            //     <option value="/humid">Humidity</option> 
            //     <option value="/infrared">Infrared</option> 
            // </select></td>

            
            //device_list.push(device.device_name);
            console.log("device list added");
            // $('#device-options').append(
            //     <option value="">${device.user_name}</option> 
            // )
            });console.log("'#devices tbody endeededed");  

            // var currentDevice = JSON.parse (localStorage.getItem('devices')) || [];
            // deviceName = currentDevice.device_name;

            // $('#devices tbody tr').on('click', (e) => {
                
            //     deviceId = e.currentTarget.getAttribute('data-device-id');
                

                
            //     //console.log("Device clicked");
                
            //     const temp_date = new Date();
            //     const temp_value = Math.random() * 100;
            //     const temp_unit = "F";
    
            //     temp_body = {
            //        temp_date,
            //        temp_value,
            //        temp_unit     
            //     };
                
            //     console.log(deviceId);
            //     $.post(`${API_URL}/devices/${deviceId}/temperature`, temp_body)
            //     .then(response => {
            //         console.log("Added data");
            //     })
            //     .catch(error => { console.error(`Error: ${error}`);
            //     }); 
                    
            // });
    
            // $('#devices tbody tr').on('click', (e) => {
            //     //console.log("Device clicked");
                
            //     const sound_date = new Date();
            //     const sound_value = Math.random() * 100;
            //     const sound_unit = "dB";
    
            //     sound_body = {
            //         sound_date,
            //         sound_value,
            //         sound_unit     
            //     };
                
            //     console.log(deviceId);
            //     $.post(`${API_URL}/devices/${deviceId}/sound`, sound_body)
            //     .then(response => {
            //         console.log("Added data");
            //     })
            //     .catch(error => { console.error(`Error: ${error}`);
            //     }); 
                    
            // });
    
            // $('#devices tbody tr').on('click', (e) => {
            //     //console.log("Device clicked");
                
            //     const accel_date = new Date();
            //     const accel_value = Math.random() * 100;
            //     const accel_unit = "m/s^2";
    
            //     accel_body = {
            //         accel_date,
            //         accel_value,
            //         accel_unit     
            //     };
                
            //     console.log(deviceId);
            //     $.post(`${API_URL}/devices/${deviceId}/accelerometer`, accel_body)
            //     .then(response => {
            //         console.log("Added data");
            //     })
            //     .catch(error => { console.error(`Error: ${error}`);
            //     }); 
                    
            // });
    
            // $('#devices tbody tr').on('click', (e) => {
            //     //console.log("Device clicked");
                
            //     const humid_date = new Date();
            //     const humid_value = Math.random() * 100;
            //     const humid_unit = "%";
    
            //     humid_body = {
            //         humid_date,
            //         humid_value,
            //         humid_unit     
            //     };
                
            //     console.log(deviceId);
            //     $.post(`${API_URL}/devices/${deviceId}/humidity`, humid_body)
            //     .then(response => {
            //         console.log("Added data");
            //     })
            //     .catch(error => { console.error(`Error: ${error}`);
            //     }); 
                    
            // });
    
            // $('#devices tbody tr').on('click', (e) => {
            //     //console.log("Device clicked");
                
            //     const ir_date = new Date();
            //     const ir_value = Math.random() * 100;
            //     const ir_unit = "cm";
    
            //     ir_body = {
            //         ir_date,
            //         ir_value,
            //         ir_unit     
            //     };
                
            //     console.log(deviceId);
            //     $.post(`${API_URL}/devices/${deviceId}/infrared`, ir_body)
            //     .then(response => {
            //         console.log("Added data");
            //     })
            //     .catch(error => { console.error(`Error: ${error}`);
            //     }); 
                    
            // });
            
            

            
            
                var sound_value_array = [];
                var sound_date_array = [];
                var temp_value_array = [];
                var temp_date_array = [];
                var ir_value_array = [];
                var ir_date_array = [];
                var accel_value_array = [];
                var accel_date_array = [];
                var humid_value_array = [];
                var humid_date_array = [];
    
            $('#devices tbody tr').on( 'click', 'button', function (e) {

                deviceId = $(this).parents('tr').attr('data-device-id');
                //deviceId = e.currentTarget.getAttribute('data-device-id');
                //var trid = $(this).attr('data-device-id'); 
                //var trid = $(this).getAttribute('data-device-id');
                var action = this.className;
                
                
                if (action == 'sound')
                {
                    
                    console.log('Button Sound: ' + deviceId);

                    $.get(`${API_URL}/devices/${deviceId}/sound`)
                    .then(response => { response.forEach((sound_data) => {
                        sound_value_array.push(sound_data.sound_value);
                        sound_date_array.push(sound_data.sound_date);
                    })
                        console.log(sound_value_array);
                        //export const sound_date_array = sound_date_array;
                        console.log(sound_date_array);
                        
                    })
                    .catch(error => { console.error(`Error: ${error}`);
                    }); 
                    location.href = `/${action}`;

                }
                else if (action == 'temp')
                {
                    console.log('Button Temp:' + deviceId);

                    $.get(`${API_URL}/devices/${deviceId}/temperature`)
                    .then(response => { response.forEach((temp_data) => {
                        temp_value_array.push(temp_data.temp_value);
                        temp_date_array.push(temp_data.temp_date);
                    })
                        console.log(temp_value_array);
                        console.log(temp_date_array);
                    })
                    .catch(error => { console.error(`Error: ${error}`);
                    }); 
                    location.href = `/${action}`;
                }
                else if (action == 'infrared')
                {
                    console.log('Button IR:' + deviceId);

                    $.get(`${API_URL}/devices/${deviceId}/infrared`)
                    .then(response => { response.forEach((ir_data) => {
                        ir_value_array.push(ir_data.ir_value);
                        ir_date_array.push(ir_data.ir_date);
                    })
                        console.log(ir_value_array);
                        console.log(ir_date_array);
                    })
                    .catch(error => { console.error(`Error: ${error}`);
                    }); 
                    location.href = `/${action}`;
                }
                else if (action == 'accelerometer')
                {
                    console.log('Button Accel:' + deviceId);

                    $.get(`${API_URL}/devices/${deviceId}/accelerometer`)
                    .then(response => { response.forEach((accel_data) => {
                        accel_value_array.push(accel_data.accel_value);
                        accel_date_array.push(accel_data.accel_date);
                    })
                        console.log(accel_value_array);
                        console.log(accel_date_array);
                    })
                    .catch(error => { console.error(`Error: ${error}`);
                    }); 
                    location.href = `/${action}`;
                }
                else if (action == 'humid')
                {
                    console.log('Button Accel:' + deviceId);

                    $.get(`${API_URL}/devices/${deviceId}/humidity`)
                    .then(response => { response.forEach((humid_data) => {
                        humid_value_array.push(humid_data.humid_value);
                        humid_date_array.push(humid_data.humid_date);
                    })
                        console.log(humid_value_array);
                        console.log(humid_date_array);
                    })
                    .catch(error => { console.error(`Error: ${error}`);
                    }); 
                    location.href = `/${action}`;
                }
                else if (this.id == 'add')
                {
                    const instruct = $('#instruct').val(); 
                    console.log(`Instruction is: ${instruct}`);

                    instruct_body = {
                        instruct
                    }

                    $.post(`${API_URL}/devices/${deviceId}/instructions`, instruct_body)
                    .then(response => {
                        console.log("Added data");
                    })
                }
                //This has an error
                else if (this.id == 'view')
                {
                    var instruct_array =[];
                    
                    $.get(`${API_URL}/devices/${deviceId}/instructions`)
                    .then(response => { response.forEach((instructions) => {
                        

                        instruct_array.push(instructions.instruct);
                    })
                        console.log(instruct_array);
                        
                    })
                    .catch(error => { console.error(`Error: ${error}`);
                    }); 
                }
                
               
            } );

        })

        
        .catch(error => {
            console.error(`Error: ${error}`);
        });
        }
        else
        {
            const path = window.location.pathname;
                    
            //users should login before tgey can see other pages
            if (path !== '/login' && path !== '/registration') {
                location.href = '/login'; 
            }
        }

        
        
        

            
        // };

        // $('#device-data1').append(`
        // <tr>
        // <td>${sensorData.acceleration.accel_value}</td>
        // <td>${sensorData.acceleration.unit}</td>
        // <td>${sensorData.temperature.temp_value}</td>
        // <td>${sensorData.temperature.unit}</td>
        // <td>${sensorData.sound.sound_peak_dB}</td>
        // <td>${sensorData.sound.sound_avg_dB}</td>
        // </tr>
        // `);

// $.get(`${API_URL}/devices`).then(response => {
//     response.forEach((device) => {
//         console.log("'#devices tbody'");
//         console.log(device);
//         $('#devices tbody').append(`
//         <tr data-device-id=${device._id}>
//         <td>${device.user_name}</td>
//         <td>${device.device_name}</td>
//         </tr>`);
// });});
// $('#devices tbody tr').on('click', (e) => {
//     console.log("#devices tbody trasdasdasdasdasdasqwd");
//     const deviceId = e.currentTarget.getAttribute('data-device-id');
//     location.href="/device-data";
//     $.get(`${API_URL}/devices/${deviceId}/device-history`).then(response => {response.map(sensorData => {
//         $('#data').empty();
//         $('#data').append(`
//         <tr>
//         <td>${sensor_data.acceleration.accel_value}</td>
//         <td>${sensor_data.acceleration.unit}</td>
//         <td>${sensor_data.temperature.temp_value}</td>
//         <td>${sensor_data.temperature.unit}</td>
//         <td>${sensor_data.sound.sound_peak_dB}</td>
//         <td>${sensor_data.sound.sound_avg_dB}</td>
//         </tr>
//         `);
//         });
        
//     });
// });

// var temp_array = [];

// $.get(`${API_URL}/devices/:device_name/temperature`) 
// .then(response => {
//     response.forEach(data => { 
        
//         temp_array.push(data.temp_value);
//     });
//     //append it to html
// })
// .catch(error => {
//     console.error(`Error: ${error}`); 
// });


var adddeviceapp=angular.module('adddeviceapp',[]);
adddeviceapp.controller('formCtrl',function($scope)
{
    $scope.username="";
    $scope.name="";
    $scope.save = function() {
        const user_name = $scope.username;
        const device_name = $scope.name;
        const patient_name = $scope.baby_name;
        console.log("username: "+user_name);
        console.log("name: "+device_name);
        console.log("Baby name: "+patient_name);
        const sensor_data = [];
        const body = {
        device_name,
        user_name,
        patient_name,
        };
        $.post(`${API_URL}/devices`, body)
        .then(response => {
        location.href = '/';
        })
        .catch(error => {
        console.error(`Error: ${error}`);
    });
        
        
    }
});





// $('#send-command').on('click', function() { 
//     const command = $('#command').val(); 
//     console.log(`command is: ${command}`);
// });

$('#send-command').on('click', function() { 
    const command = $('#command').val(); 
    console.log(`command is: ${command}`);
    const deviceId = $('#deviceId').val(); 
    
    

    // console.log("Attempting PUT");
    // $.put(`${MQTT_URL}/sound-data`, { deviceId })
    // console.log("Attempted PUT " + deviceId);
    

    $.post(`${MQTT_URL}/send-command`, { deviceId, command }) 

});






var loginapp=angular.module('loginapp',[]);
loginapp.controller('formCtrl',function($scope,$http)
{
    $scope.username="";
    $scope.password="";
    $scope.bool=false;
    $scope.submit = function() {
        const user = $scope.username;
        const password = $scope.password;
        //console.log("name: "+user);
        //console.log("password: "+password);
        $.post(`${API_URL}/authenticate`, { "name":user, "password":password })
    .then((response) =>{
        // console.log("response");
        // console.log(response);
    if (response.success) 
    {
        //console.log("response");
        //console.log(response);
        localStorage.setItem('user', user);
        localStorage.setItem('isAdmin', response.isAdmin);
        localStorage.setItem('isAuthenticated',true);
        location.href = '/';
    }
    else
    {
        $scope.message=response;
        $scope.bool=true;
    }
    });
        
    }
});
const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    location.href = '/login';
    }
    var registerapp=angular.module('registerapp',[]);
    registerapp.directive('passwordvalidation', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attr, mCtrl) {
                function myValidation(value) {
                    if (value.length >= 8) {
                        mCtrl.$setValidity('charE', true);
                    } else {
                        mCtrl.$setValidity('charE', false);
                    }
                    return value;
                }
                mCtrl.$parsers.push(myValidation);
            }
        };
    });
    registerapp.controller('formCtrl',function($scope)
    {
        $scope.username="";
        $scope.password="";
        $scope.confirm="";
        var strength = "";
        $scope.grade = function() {
            var size = $scope.password.length;
            if (size > 12) 
            {
              strength = 'strong';
            } else if (size > 8) 
            {
              strength = 'medium';
            } else 
            {
              strength = 'weak';
            }
            
            return strength;
        }
        $scope.register = function() {
        const user = $scope.username;
        const password = $scope.password;
        const confirm = $scope.confirm;
        const isAdmin=false;
        console.log("name: "+user);
        console.log("password: "+password);
        console.log("confirm: "+confirm);
        $.post(`${API_URL}/authenticate`, { "name":user, "password":password })
        .then((response) =>{
            console.log("response");
            console.log(response);
            if(password!=confirm)
            {
                $(".message").empty();
                $(".message").append("<p> Your Password and Confirm Password inputs do not match.</p>");
                //location.href = '/registration';
            }
            else
            {
                $.post(`${API_URL}/registration`, { "name":user, "password":password, "isAdmin":isAdmin}).then((response) =>{if (response.success) {
            //location.href = '/login';
            console.log("registration successfull");
            }
            else {
            $('#message').append(`<p class="alert alert-danger">${response}</p>`);
        }
    });
            
        }
    });
        }
    });