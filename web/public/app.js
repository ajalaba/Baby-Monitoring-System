$('#navbar').load('navbar.html');
$('#footbar').load('footer.html');

const API_URL = 'http://localhost:5000/api';

const response = $.get(`${API_URL}/devices`);

const isAuthenticated=JSON.parse(localStorage.getItem('isAuthenticated')) || false;
const currentUser = localStorage.getItem('user');
var sesnorData;

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

$.get(`${API_URL}/devices`).then(response => {
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
        const user = $scope.username;
        const devicename = $scope.name;
        console.log("username: "+user);
        console.log("name: "+name);
        const sensorData = [];
        const body = {
        devicename,
        user,
        sensorData
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

$('#send-command').on('click', function() { 
    const command = $('#command').val(); 
    console.log(`command is: ${command}`);
});






