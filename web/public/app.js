$('#navbar').load('navbar.html');
$('#footbar').load('footer.html');

const API_URL = 'http://localhost:5000/api';

const response = $.get(`${API_URL}/devices`);

const isAuthenticated=JSON.parse(localStorage.getItem('isAuthenticated')) || false;
const currentUser = localStorage.getItem('user');
var sesnorData;

if (currentUser) 
{
    $.get(`${API_URL}/users/${currentUser}/devices`).then(response => {
        response.forEach((device) => {
                console.log("'#devices tbody'");
                $('#devices tbody').append(`
                <tr data-device-id=${device._id}>
                <td>${device.user_name}</td>
                <td>${device.device_name}</td>
                </tr>`
                );
                });console.log("'#devices tbody endeededed");
                $('#devices tbody tr').on('click', (e) => {
                    console.log("#devices tbody trasdasdasdasdasdasqwd");
                    const deviceId = e.currentTarget.getAttribute('data-device-id');
                    console.log(deviceId);
                    $.get(`${API_URL}/devices/${deviceId}/device-history`).then(response => {response.map(sensor_data => {
                        sensorData=sensor_data;
                        $('#device-data').append(`
                        <tr>
                        <td>${sensor_data.acceleration.accel_value}</td>
                        <td>${sensor_data.acceleration.unit}</td>
                        <td>${sensor_data.temperature.temp_value}</td>
                        <td>${sensor_data.temperature.unit}</td>
                        <td>${sensor_data.sound.sound_peak_dB}</td>
                        <td>${sensor_data.sound.sound_avg_dB}</td>
                        </tr>
                        `);
                        });
                        
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
            
            if (path !== '/login')
            {
                //location.href = '/login';
            }
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
        console.log("username: "+user_name);
        console.log("name: "+device_name);
        const sensor_data = [];
        const body = {
        device_name,
        user_name,
        sensor_data
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






var sendcommandapp = angular.module('sendcommandapp',[]);

sendcommandapp.controller('formCtrl',function($scope)
{
    $scope.deviceId="";
    $scope.command="";
    $scope.send= function() {
        const deviceId = $scope.deviceId;
    const command = $scope.command;
    console.log("send-commad entered"+deviceId+command);
    $.post(`${MQTT_URL}/send-command`, { "deviceId":deviceId, "command":command })
    .then((response) =>{
        console.log("response");
        console.log(response);
    if (response.success) 
    {
        $('#message').append(`<p>${response}</p>`);
    }
    else
    {
        $('#message').append(`<p class="alert alert-danger">${response}</p>`);
    }
    });
}
});






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

const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    location.href = '/login';
    }


    var loginapp=angular.module('loginapp',[]);
    loginapp.controller('formCtrl',function($scope,$http)
    {
        $scope.username="";
        $scope.password="";
        $scope.bool=false;
        $scope.submit = function() {
            const user = $scope.username;
            const password = $scope.password;
            console.log("name: "+user);
            console.log("password: "+password);
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