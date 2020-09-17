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

var current_device=localStorage.getItem('current_device') || "" ;

var devicelist=[];


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


var buttonpressed=0;

// var deviceapp=angular.module('deviceapp',[]);
// deviceapp.controller('formCtrl',function($scope)
// {
//     $scope.devlist=deviceslist;
//     console.log("devlist");
//     console.log($scope.devlist);
// });

$.get(`${API_URL}/users/${currentUser}/devices`).then(response => { 
    for(var i=0; i<response.length;i++ )
    {
        console.log(response[0].device_name);
        var deviceinfo={"deviceName": response[i].device_name,"deviceId":String(response[i]._id)};
        devicelist.push(deviceinfo);
    }
    //deviceId=response[0]._id;
    deviceId=current_device;
           

    // console.log("Response");
    // console.log (response);
    // console.log("deviceList");
    // console.log(devicelist);
    
}).catch(error => { console.error(`Error: ${error}`);
});





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

            

            console.log("device list added");

            });console.log("'#devices tbody endeededed");

            deviceId=current_device;
            $.get(`${API_URL}/devices/${deviceId}/sound`).then(sound_response => { 
                console.log("Sound response");
                console.log(sound_response);
                sound_data = sound_response;
                for(var i=0; i<sound_response.length;i++ )
                {
                    console.log("sound response 1 value");
                    console.log(sound_response[i].sound_value);
                   sound_value_array.push(parseInt(sound_response[i].sound_value));
                   sound_date_array.push(sound_response[i].sound_date);
                }
            }).catch(error => { console.error(`Error: ${error}`);});
            console.log("sound_value_array");
            console.log(sound_value_array[12]);
            console.log(sound_date_array);
            //console.log(sound_data);



            $.get(`${API_URL}/devices/${deviceId}/temperature`).then(response => 
                { response.forEach((temp_data) => {
                    temp_value_array.push(temp_data.temp_value);
                    temp_date_array.push(temp_data.temp_date);
                })
                // console.log(temp_value_array);
                // console.log(temp_date_array);
            }).catch(error => { console.error(`Error: ${error}`);});
            
            $.get(`${API_URL}/devices/${deviceId}/infrared`)
                    .then(response => { response.forEach((ir_data) => {
                        ir_value_array.push(ir_data.ir_value);
                        ir_date_array.push(ir_data.ir_date);
                    })
                        // console.log(ir_value_array);
                        // console.log(ir_date_array);
                    })
                    .catch(error => { console.error(`Error: ${error}`);
            });
            $.get(`${API_URL}/devices/${deviceId}/accelerometer`)
                    .then(response => { response.forEach((accel_data) => {
                        accel_value_array.push(accel_data.accel_value);
                        accel_date_array.push(accel_data.accel_date);
                    })
                        // console.log(accel_value_array);
                        // console.log(accel_date_array);
                    })
                    .catch(error => { console.error(`Error: ${error}`);
            });
            $.get(`${API_URL}/devices/${deviceId}/humidity`)
                    .then(response => { response.forEach((humid_data) => {
                        humid_value_array.push(humid_data.humid_value);
                        humid_date_array.push(humid_data.humid_date);
                    })
                        // console.log(humid_value_array);
                        // console.log(humid_date_array);
                    })
                    .catch(error => { console.error(`Error: ${error}`);
            });  
            

            
                
    
            $('#devices tbody tr').on( 'click', 'button', function (e) {
                console.log("Clicl ENtered");

                deviceId = $(this).parents('tr').attr('data-device-id');
                current_device=deviceId
                console.log(current_device);
                localStorage.setItem('current_device',current_device);
                //deviceId = e.currentTarget.getAttribute('data-device-id');
                //var trid = $(this).attr('data-device-id'); 
                //var trid = $(this).getAttribute('data-device-id');
                var action = this.className;
                
                
                if (action == 'sound')
                {
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
                else if (action == 'temp')
                {
                    console.log('Button Temp:' + deviceId);
                    location.href = `/${action}`;
                }
                else if (action == 'infrared')
                {
                    console.log('Button IR:' + deviceId);
                    location.href = `/${action}`;
                }
                else if (action == 'accelerometer')
                {
                    console.log('Button Accel:' + deviceId);
                    location.href = `/${action}`;
                }
                else if (action == 'humid')
                {
                    console.log('Button Accel:' + deviceId);
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
                    var instruct_array = [];
                    $.get(`${API_URL}/devices/${deviceId}/instructions`)
                    .then(response => { response.map((instructions) => {
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
        console.log("submit entered");
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
const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    location.href = '/login';
    };

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


    // var navapp = angular.module("navapp", ["ngRoute"]);
    // navapp.config(function($routeProvider) {
    //     $routeProvider
    //     .when("/#!evice-list", {
    //         templateUrl : "/device-list.html"
    //     })
    //     .when("/#!register-device", {
    //         templateUrl : "<p> I hate this </p>"
    //     })
    //     .when("/send-command", {
    //         templateUrl : "/send-command.html"
    //     })
    //     .when("/notifications", {
    //         templateUrl : "/notifications.html"
    //     })
    //     .when("/", {
    //         templateUrl : "/device-list.html"
    //     });
    // });

    var notification1={
        "title":"Baby Monitor Notifications",
        "description":" Is this woaasd?"
    };
    var notification2={
        "title":"adasdasdBaby Monitor Notifications",
        "description":" Is this woaasd?"
    };
    var notification3={
        "title":"adasdasda111asdBaby Monitor Notifications",
        "description":" Is this woaasd?"
    };
    var notification4={
        "title":"1111111a1dasdasdBaby Monitor Notifications",
        "description":" Is this woaasd?"
    };
    var notificationlist=[];
    notificationlist.push(notification1);
    notificationlist.push(notification2);
    notificationlist.push(notification3);
    notificationlist.push(notification4);
    console.log(notificationlist);


    var notifyapp=angular.module('notifyapp',[]);
    notifyapp.controller('formCtrl',function($scope,$http)
    {
        $scope.notlist=notificationlist;
        $scope.deletenotification= function(index) {
            // delete notificationlist[index];
            // delete $scope.notlist[index];
            notificationlist.splice(index,1);
            //$scope.notlist.splice(index,1);
            //console.log(notificationlist);
            //console.log($scope.notlist);
        }


    });


    console.log("Button Pressed");
    console.log(buttonpressed);
    console.log("sound_value_array");
    console.log(sound_value_array);
    console.log(sound_date_array);