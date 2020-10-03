
var adddeviceapp = angular.module('adddeviceapp', []);
adddeviceapp.controller('formCtrl', function ($scope) {
    $scope.username = "";
    $scope.name = "";
    $scope.babyname="";
    $scope.save = function () {
        const user_name = $scope.username;
        const device_name = $scope.name;
        const patient_name = $scope.babyname;
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