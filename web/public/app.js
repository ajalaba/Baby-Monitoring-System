$('#navbar').load('navbar.html');
$('#footbar').load('footer.html');

// const API_URL = 'https://api-theta-nine.vercel.app/api/';
const API_URL = 'http://localhost:5000/api';
const MQTT_URL = `http://localhost:5001`;

const response = $.get(`${API_URL}/devices`);


const isAuthenticated = JSON.parse(localStorage.getItem('isAuthenticated')) || false;
const currentUser = localStorage.getItem('user');
var sesnorData;
var currentDevice;
var deviceName;
var temp;
var deviceId;

var current_device = localStorage.getItem('current_device') || "";

var devicelist = [];


var sound_value_array = [];

var sound_date_array = [];
var sound_data;
var temp_value_array = [];
var temp_date_array = [];
var ir_value_array = [];
var ir_date_array = [];
var accel_value_array = [];
var accel_date_array = [];
var humid_value_array = [];
var humid_date_array = [];

var notificationlist = [];
// notificationlist.push(notification1);
// notificationlist.push(notification2);
// notificationlist.push(notification3);
// notificationlist.push(notification4);
//console.log(notificationlist);




var buttonpressed = 0;

var app1=angular.module('navapp',[]);
// app1.controller('formCtrl',function($scope, $http)
// {
//     //$scope.devlist=notificationlist;
//     $scope.devlist=devicelist;
//     $http.get(`${API_URL}/users/${currentUser}/devices`).then(function(response)
//     {
//         console.log(response);
//     });
//     console.log("devlist");
//     console.log($scope.devlist);
//     console.log($scope.devlist[1]);
// });

deviceId = current_device;
try{
    var BaseConfig = $.ajax({
        async: false,
        url: `${API_URL}/users/${currentUser}/notifications`,
        type: 'get',
        data: { 'GetConfig': 'YES' },
        dataType: "JSON"
    }).responseJSON;
    for(var i=0;i<BaseConfig.length;i++)
    {
        notificationlist.push(BaseConfig[i]);  
    }
    console.log(BaseConfig);




    
    
    
    
    
}
catch(err)
{
    console.log(err);
}


$.get(`${API_URL}/users/${currentUser}/devices`).then(response => {
    for (var i = 0; i < response.length; i++) {
        //console.log(response[0].device_name);
        var deviceinfo = { "deviceName": response[i].device_name, "deviceId": String(response[i]._id) };
        devicelist.push(deviceinfo);
    }
    //deviceId=response[0]._id;
    deviceId = current_device;


    // console.log("Response");
    // console.log (response);
    // console.log("deviceList");
    // console.log(devicelist);

}).catch(error => {
    console.error(`Error: ${error}`);
});
console.log(devicelist);

// deviceId="5f5a3cf860dd4313c1c7184d";
// var arr=$.ajax({
//     async:false,
//     url:`${API_URL}/devices/${deviceId}/sound`,
//     type:'get',
//     data:{'GetConfig':'YES'},
//     dataType:"JSON"
//     }).responseJSON;
// console.log(arr);
// for(var i=0;i<arr.length;i++)
// {
//     sound_value_array.push(Number(arr[i].sound_value));
// }
// console.log("adasd---------------------");
// console.log(sound_value_array);
// console.log(sound_value_array[20]);
// console.log(typeof(arr[30].sound_value));

// deviceId=current_device;
// axios.get(`${API_URL}/devices/${deviceId}/sound`).then(resp =>
// {
//     sound_value_array.push(20);
//     for(var i=0; i<resp.length;i++ )
//     {
//         console.log("sound response 1 value");
//         console.log(resp[i].sound_value);
//         sound_value_array.push(Number(resp[i].sound_value));
//         sound_date_array.push(resp[i].sound_date);
//         console.log("sound_value_array");
//             console.log(sound_value_array);
//             console.log(typeof(sound_value_array));
//             console.log(sound_value_array[3]);
//     }    
// });



if (currentUser) {
    $.get(`${API_URL}/users/${currentUser}/devices`)
        .then(response => {
            response.forEach((device) => {
                //console.log("'#devices tbody'");
                currentDevice = device;
                deviceName = currentDevice.device_name;

                $('#devices tbody').append(`
    <tr data-device-id=${device._id}>
    <td>${device.patient_name}</td>
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
           

            //dashboard start
            var soundarray = $.ajax({
                async: false,
                url: `${API_URL}/devices/${currentDevice._id}/sound`,
                type: 'get',
                data: { 'GetConfig': 'YES' },
                dataType: "JSON"
            }).responseJSON;
            var sound_value = Number(soundarray[soundarray.length-1].sound_value);
            sound_value = Math.round(sound_value * 100) / 100;
            console.log("Sound value = " + sound_value);

            var temparray = $.ajax({
                async: false,
                url: `${API_URL}/devices/${currentDevice._id}/temperature`,
                type: 'get',
                data: { 'GetConfig': 'YES' },
                dataType: "JSON"
            }).responseJSON;
            var temp_value = Number(temparray[temparray.length-1].temp_value);
            temp_value = Math.round(temp_value * 100) / 100;
            console.log("temp value = " + temp_value);

            var humidarray = $.ajax({
                async: false,
                url: `${API_URL}/devices/${currentDevice._id}/humidity`,
                type: 'get',
                data: { 'GetConfig': 'YES' },
                dataType: "JSON"
            }).responseJSON;
            var humid_value = Number(humidarray[humidarray.length-1].humid_value);
            humid_value = Math.round(humid_value * 100) / 100;
            console.log("Humid value = " + humid_value);

            var accelarray = $.ajax({
                async: false,
                url: `${API_URL}/devices/${currentDevice._id}/accelerometer`,
                type: 'get',
                data: { 'GetConfig': 'YES' },
                dataType: "JSON"
            }).responseJSON;
            var accel_value = Number(accelarray[accelarray.length-1].accel_value);
            accel_value = Math.round(accel_value * 100) / 100;
            console.log("Accel value = " + accel_value);

            var irarray = $.ajax({
                async: false,
                url: `${API_URL}/devices/${currentDevice._id}/infrared`,
                type: 'get',
                data: { 'GetConfig': 'YES' },
                dataType: "JSON"
            }).responseJSON;
            var ir_value = Number(irarray[irarray.length-1].ir_value);
            ir_value = Math.round(ir_value * 100) / 100;
            console.log("IR value = " + ir_value);

            $('#inside-box').append(`
            <div class="third widget ${currentDevice.patient_name}" style="border:2px solid teal;color:black">
        
            <h2>${currentDevice.patient_name}</h2>
            <div class="canvas-container">
                
                <p style="font-size:120%;"><b>Last sensor readings:</b></p>
                <div style="background-color:cadetblue;color:black;padding:10px;">
                    Sound - <b>${sound_value} dB </b>
                </div>
                <div style="background-color:salmon;color:black;padding:10px;">
                    Temperature - <b>${temp_value} F </b>
                </div>
                <div style="background-color:lightgreen;color:black;padding:10px;">
                    Humidity - <b>${humid_value} % </b>
                </div>
                <div style="background-color:yellow;color:black;padding:10px;">
                    Acceleration - <b>${accel_value} m/s^2 </b>
                </div>
                <div style="background-color:lightskyblue;color:black;padding:10px;">
                    Infrared - <b>${ir_value} </b>
                </div>

                
            </div>
            `);
        });







            $('#devices tbody tr').on('click', 'button', function (e) {
                //console.log("Clicl ENtered");

                deviceId = $(this).parents('tr').attr('data-device-id');
                current_device = deviceId
                //console.log(current_device);
                localStorage.setItem('current_device', current_device);
                //deviceId = e.currentTarget.getAttribute('data-device-id');
                //var trid = $(this).attr('data-device-id'); 
                //var trid = $(this).getAttribute('data-device-id');
                var action = this.className;


                if (action == 'sound') {
                    // console.log('Button Sound: ' + deviceId);
                    // console.log("adsasdasdasdasd");
                    // $.get(`${API_URL}/devices/${deviceId}/sound`).then(sound_response => { 
                    //     //console.log("Sound response");
                    //     //console.log(sound_response);
                    //     //sound_data=sound_response;
                    //     //console.log(sound_data);
                    //     for(var i=0; i<sound_response.length;i++ )
                    //     {
                    //         //console.log("sound response 1 value");
                    //         //console.log(sound_response[i].sound_value);
                    //         sound_value_array.push(sound_response[i].sound_value);
                    //         sound_date_array.push(sound_response[i].sound_date);
                    //     }
                    // }).catch(error => { 
                    //     console.error(`Error: ${error}`);
                    // });
                    // localStorage.setItem('sound_value_array', JSON.stringify(sound_value_array));
                    // localStorage.setItem('sound_date_array', JSON.stringify(sound_date_array));
                    // console.log("sound_value_array");
                    // console.log(sound_value_array);
                    // console.log(sound_date_array);
                    //export {sound_value_array} from 'app.js';
                    // $.get(`${API_URL}/devices/${deviceId}/sound`)
                    // .then(response => { response.forEach((sound_data) => {
                    //     sound_value_array.push(sound_data.sound_value);
                    //     sound_date_array.push(sound_data.sound_date);
                    // })
                    //     console.log(sound_value_array);
                    //     //export const sound_date_array = sound_date_array;
                    //     console.log(sound_date_array);

                    // })
                    // .catch(error => { console.error(`Error: ${error}`);
                    // }); 
                    location.href = `/${action}`;

                }
                else if (action == 'temp') {
                    console.log('Button Temp:' + deviceId);
                    location.href = `/${action}`;
                }
                else if (action == 'infrared') {
                    console.log('Button IR:' + deviceId);
                    location.href = `/${action}`;
                }
                else if (action == 'accelerometer') {
                    console.log('Button Accel:' + deviceId);
                    location.href = `/${action}`;
                }
                else if (action == 'humid') {
                    console.log('Button Accel:' + deviceId);
                    location.href = `/${action}`;
                }
                else if (this.id == 'add') {
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
                else if (this.id == 'view') {
                    var instruct_array = [];
                    $.get(`${API_URL}/devices/${deviceId}/instructions`)
                        .then(response => {
                            response.map((instructions) => {
                                $('#historyContent').append(`
                            <tr>
                            <td>${instructions.instruct}</td>
                            </tr>
                            `);
                            });
                            $('#historyModal').modal('show');
                        });

                    // var instruct_array =[];

                    // $.get(`${API_URL}/devices/${deviceId}/instructions`)
                    // .then(response => { response.forEach((instructions) => {


                    //     instruct_array.push(instructions.instruct);
                    // })
                    //     console.log(instruct_array);

                    // })
                    // .catch(error => { console.error(`Error: ${error}`);
                    // }); 
                }


            });

        })


        .catch(error => {
            console.error(`Error: ${error}`);
        });
}
else {
    const path = window.location.pathname;

    //users should login before tgey can see other pages
    if (path !== '/login' && path !== '/registration') {
        location.href = '/login';
    }
}






var adddeviceapp = angular.module('adddeviceapp', []);
adddeviceapp.controller('formCtrl', function ($scope) {
    $scope.username = "";
    $scope.name = "";
    $scope.save = function () {
        const user_name = $scope.username;
        const device_name = $scope.name;
        const patient_name = $scope.baby_name;
        console.log("username: " + user_name);
        console.log("name: " + device_name);
        console.log("Baby name: " + patient_name);
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





$('#send-command').on('click', function () {
    const command = $('#command').val();
    console.log(`command is: ${command}`);
    const deviceId = $('#deviceId').val();
    console.log("Attempting PUT");
    $.post(`${MQTT_URL}/send-command`, { deviceId, command });
    console.log("Attempted PUT " + deviceId);

});


var sendcommandapp = angular.module('sendcommandapp', []);

sendcommandapp.controller('formCtrl', function ($scope) {
    $scope.deviceId = "";
    $scope.command = "";
    $scope.send = function () {
        const deviceId = $scope.deviceId;
        const command = $scope.command;
        //console.log("send-commad entered "+deviceId+" "+command);
    }

    //$.post(`${MQTT_URL}/send-command`, { deviceId, command });
});



var loginapp = angular.module('loginapp', []);
loginapp.controller('formCtrl', function ($scope, $http) {
    $scope.username = "";
    $scope.password = "";
    $scope.bool = false;
    $scope.submit = function () {
        console.log("submit entered");
        const user = $scope.username;
        const password = $scope.password;
        console.log("name: " + user);
        console.log("password: " + password);
        $.post(`${API_URL}/authenticate`, { "name": user, "password": password })
            .then((response) => {

                if (response.success) {

                    localStorage.setItem('user', user);
                    localStorage.setItem('isAdmin', response.isAdmin);
                    localStorage.setItem('isAuthenticated', true);
                    location.href = '/';
                }
                else {
                    $scope.message = response;
                    $scope.bool = true;
                }
            });

    }
});
const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    location.href = '/login';
};

var registerapp = angular.module('registerapp', []);
registerapp.directive('passwordvalidation', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
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
registerapp.controller('formCtrl', function ($scope) {
    $scope.username = "";
    $scope.password = "";
    $scope.confirm = "";
    $scope.email = "";
    var strength = "";
    $scope.grade = function () {
        var size = $scope.password.length;
        if (size > 12) {
            strength = 'strong';
        } else if (size > 8) {
            strength = 'medium';
        } else {
            strength = 'weak';
        }

        return strength;
    }
    $scope.register = function () {
        const user = $scope.username;
        const password = $scope.password;
        const confirm = $scope.confirm;
        const email_id = $scope.email;
        $scope.bool = false;
        const isAdmin = false;
        console.log("name: " + user);
        console.log("password: " + password);
        console.log("confirm: " + confirm);
        $.post(`${API_URL}/authenticate`, { "name": user, "password": password })
            .then((response) => {
                console.log("response");
                console.log(response);
                if (password != confirm) {
                    $(".message").empty();
                    $(".message").append("<p> Your Password and Confirm Password inputs do not match.</p>");
                    //location.href = '/registration';
                }
                else {
                    $.post(`${API_URL}/registration`, { "name": user, "password": password,"email_id":email_id, "isAdmin": isAdmin }).then((response) => {
                        if (response.success) {

                            $scope.bool = true;
                            console.log("registration successfull");
                            setTimeout(() => { location.href = '/login'; }, 2000);


                            $('#message').append(`<p class="ui message"id="error" style="color: tomato;"> Registration Successfull</p>`);
                        }
                        else {
                            $('#message').append(`<p class="alert alert-danger">${response}</p>`);
                        }
                    });

                }
            });
    }
});




var notification1 = {
    "title": "Baby Monitor Notifications",
    "description": " Is this woaasd?"
};
var notification2 = {
    "title": "adasdasdBaby Monitor Notifications",
    "description": " Is this woaasd?"
};
var notification3 = {
    "title": "adasdasda111asdBaby Monitor Notifications",
    "description": " Is this woaasd?"
};
var notification4 = {
    "title": "1111111a1dasdasdBaby Monitor Notifications",
    "description": " Is this woaasd?"
};

//console.log(BaseConfig[0]);
//notificationlist.push(BaseConfig[0]);

var notifyapp = angular.module('notifyapp', []);
notifyapp.controller('formCtrl', function ($scope, $http) {
    $scope.notlist = notificationlist;
    $scope.deletenotification = function (index) {
        // delete notificationlist[index];
        // delete $scope.notlist[index];
        $.post(`${API_URL}/users/${currentUser}/deletenotifications`, {index}).then((response)=>
        {
            if(response.success)
            {
                console.log("Deleted Successfully");
            }
            else
            {
                console.log("Error Occured");
            }
        });
        notificationlist.splice(index, 1);

        //$scope.notlist.splice(index,1);
        //console.log(notificationlist);
        //console.log($scope.notlist);
    }


});


    //console.log("Button Pressed");
    //console.log(buttonpressed);
    //console.log("sound_value_array");
    //console.log(sound_value_array);
    //console.log(sound_date_array);
