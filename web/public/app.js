$('#navbar').load('navbar.html');
$('#footbar').load('footer.html');

const API_URL = 'http://localhost:5000/api';

const response = $.get(`${API_URL}/devices`);

const isAuthenticated=JSON.parse(localStorage.getItem('isAuthenticated')) || false;
const currentUser = localStorage.getItem('user');
var sesnorData;

var currentDevice;

// $.get(`${API_URL}/users/${currentUser}/devices`).then(response => {
//     response.forEach((device) => {
//             console.log("'#devices tbody'");
//             $('#devices tbody').append(`
//             <tr data-device-id=${device._id}>
//             <td>${device.user}</td>
//             <td>${device.name}</td>
//             </tr>`
//             );
//             });
//             console.log("'#devices tbody endeededed");
//             $('#devices tbody tr').on('click', (e) => {
//                 console.log("#devices tbody trasdasdasdasdasdasqwd");
//                 const deviceId = e.currentTarget.getAttribute('data-device-id');
//                 $.get(`${API_URL}/devices/${deviceId}/device-history`).then(response => {response.map(sensorData => {
//                     $('#historyContent').empty();
//                     $('#historyContent').append(`
//                     <tr>
//                     <td>${sensorData.ts}</td>
//                     <td>${sensorData.temp}</td>
//                     <td>${sensorData.loc.lat}</td>
//                     <td>${sensorData.loc.lon}</td>
//                     </tr>
//                     `);
//                     });
//                     $('#historyModal').modal('show');
//                 });
//         });
//         })
//         .catch(error => {
//             console.error(`Error: ${error}`);
//         });

        if (currentUser) 
        {
            $.get(`${API_URL}/users/${currentUser}/devices`).then(response => {response.forEach((device) => {
            console.log("'#devices tbody'");
            currentDevice = device;
            $('#devices tbody').append(`
            <tr data-device-id=${device._id}>
            <td>${device.user_name}</td>
            <td>${device.device_name}</td>
            </tr>`
            );
            // device_list.push(device.device_name);
            console.log("device list added");
            // $('#device-options').append(
            //     <option value="">${device.user_name}</option> 
            // )
            });console.log("'#devices tbody endeededed");

        //     $('#devices tbody tr').on('click', (e) => {
        //         console.log("#devices tbody trasdasdasdasdasdasqwd");
        //         const deviceId = e.currentTarget.getAttribute('data-device-id');
        //         console.log(deviceId);
        //         $.get(`${API_URL}/devices/${deviceId}/device-history`).then(response => {response.map(sensor_data => {
        //             sensorData=sensor_data;
        //             $('#device-data').append(`
        //             <tr>
        //             <td>${sensor_data.acceleration.accel_value}</td>
        //             <td>${sensor_data.acceleration.unit}</td>
        //             <td>${sensor_data.temperature.temp_value}</td>
        //             <td>${sensor_data.temperature.unit}</td>
        //             <td>${sensor_data.sound.sound_peak_dB}</td>
        //             <td>${sensor_data.sound.sound_avg_dB}</td>
        //             </tr>
        //             `);
        //             });
                    
        //         });
        // });
        const deviceName = currentDevice.device_name;

        $('#devices tbody tr').on('click', (e) => {
            //console.log("Device clicked");
            
            const temp_date = new Date();
            const temp_value = Math.random() * 100;
            const temp_unit = "F";

            temp_body = {
               temp_date,
               temp_value,
               temp_unit     
            };
            
            console.log(deviceName);
            $.post(`${API_URL}/devices/${deviceName}/temperature`, temp_body)
            .then(response => {
                console.log("Added data");
            })
            .catch(error => { console.error(`Error: ${error}`);
            }); 
                
        });

        $('#devices tbody tr').on('click', (e) => {
            //console.log("Device clicked");
            
            const sound_date = new Date();
            const sound_value = Math.random() * 100;
            const sound_unit = "dB";

            sound_body = {
                sound_date,
                sound_value,
                sound_unit     
            };
            
            console.log(deviceName);
            $.post(`${API_URL}/devices/${deviceName}/sound`, sound_body)
            .then(response => {
                console.log("Added data");
            })
            .catch(error => { console.error(`Error: ${error}`);
            }); 
                
        });

        $('#devices tbody tr').on('click', (e) => {
            //console.log("Device clicked");
            
            const accel_date = new Date();
            const accel_value = Math.random() * 100;
            const accel_unit = "m/s^2";

            accel_body = {
                accel_date,
                accel_value,
                accel_unit     
            };
            
            console.log(deviceName);
            $.post(`${API_URL}/devices/${deviceName}/accelerometer`, accel_body)
            .then(response => {
                console.log("Added data");
            })
            .catch(error => { console.error(`Error: ${error}`);
            }); 
                
        });

        $('#devices tbody tr').on('click', (e) => {
            //console.log("Device clicked");
            
            const humid_date = new Date();
            const humid_value = Math.random() * 100;
            const humid_unit = "%";

            humid_body = {
                humid_date,
                humid_value,
                humid_unit     
            };
            
            console.log(deviceName);
            $.post(`${API_URL}/devices/${deviceName}/humidity`, humid_body)
            .then(response => {
                console.log("Added data");
            })
            .catch(error => { console.error(`Error: ${error}`);
            }); 
                
        });

        $('#devices tbody tr').on('click', (e) => {
            //console.log("Device clicked");
            
            const ir_date = new Date();
            const ir_value = Math.random() * 100;
            const ir_unit = "cm";

            ir_body = {
                ir_date,
                ir_value,
                ir_unit     
            };
            
            console.log(deviceName);
            $.post(`${API_URL}/devices/${deviceName}/infrared`, ir_body)
            .then(response => {
                console.log("Added data");
            })
            .catch(error => { console.error(`Error: ${error}`);
            }); 
                
        });

        })
        .catch(error => {
            console.error(`Error: ${error}`);
        });
        }
        else
        {
            const path = window.location.pathname;
                    
            //users should login before tgey can see other pages
            // if (path !== '/login' && path !== '/registration') {
            //     location.href = '/login'; 
            // }
        } 

        
        

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






$('#send-command').on('click', function() { 
    const command = $('#command').val(); 
    console.log(`command is: ${command}`);
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