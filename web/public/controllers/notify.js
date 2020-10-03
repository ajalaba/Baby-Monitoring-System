var notificationlist = [];
var notifyapp = angular.module('notifyapp', []);
notifyapp.controller('formCtrl', function ($scope, $http) {
    $scope.notlist = [];
    $scope.notlist = notificationlist;
    //console.log(notificationlist);
    //console.log($scope.notlist);
    $scope.deletenotification = function (index) {
        // delete notificationlist[index];
        // delete $scope.notlist[index];
        $.post(`${API_URL}/users/${currentUser}/deletenotifications`, {index}).then((response)=>
        {
            console.log("Deleted Successfully");
        }).catch(error => {
            console.error(`Error: ${error}`);
        });
        notificationlist.splice(index, 1);

        //$scope.notlist.splice(index,1);
        console.log(notificationlist);
        console.log($scope.notlist);
    }
});