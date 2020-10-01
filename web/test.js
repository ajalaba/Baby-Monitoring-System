describe('calculator', function () {
	
	it('1 + 1 should equal 2', function () {
		expect(1+1).toBe(2);
	});

});
beforeAll(() => {
	window.onbeforeunload = () => 'Oh no!';
  });



describe('loginController', function() {
	beforeEach(module('loginapp'));
  
	var $controller, $rootScope;
  
	beforeEach(inject(function(_$controller_, _$rootScope_){
	  // The injector unwraps the underscores (_) from around the parameter names when matching
	  $controller = _$controller_;
	  $rootScope = _$rootScope_;
	}));
  
	describe('$scope testing', function() {
	  it('tests if the login input bool is false', function() {
		var $scope = $rootScope.$new();
		var controller = $controller('formCtrl', { $scope: $scope });
		$scope.password = '12345678';
		$scope.username="test4";
		expect($scope.bool).toEqual(false);
	  });
	});
});
describe('registerdeviceController', function() {
	beforeEach(module('adddeviceapp'));
  
	var $controller, $rootScope;
  
	beforeEach(inject(function(_$controller_, _$rootScope_){
	  // The injector unwraps the underscores (_) from around the parameter names when matching
	  $controller = _$controller_;
	  $rootScope = _$rootScope_;
	}));
  
	describe('$scope testing', function() {
	  it('tests if the adddeviceapp controller is working without errors', function() {
		var $scope = $rootScope.$new();
		var controller = $controller('formCtrl', { $scope: $scope });
		$scope.password = '12345678';
		$scope.name="test4";
		expect().toEqual();
	  });
	});
});
describe('sendcommandappController', function() {
	beforeEach(module('sendcommandapp'));
  
	var $controller, $rootScope;
  
	beforeEach(inject(function(_$controller_, _$rootScope_){
	  // The injector unwraps the underscores (_) from around the parameter names when matching
	  $controller = _$controller_;
	  $rootScope = _$rootScope_;
	}));
  
	describe('$scope testing', function() {
	  it('tests if the send command controller is working without errors', function() {
		var $scope = $rootScope.$new();
		var controller = $controller('formCtrl', { $scope: $scope });
		$scope.deviceId = '12345678';
		$scope.command="test4";
		expect().toEqual();
	  });
	});
});
// describe('notifyappController', function() {
// 	beforeEach(module('notifyapp'));
  
// 	var $controller, $rootScope;
  
// 	beforeEach(inject(function(_$controller_, _$rootScope_){
// 	  // The injector unwraps the underscores (_) from around the parameter names when matching
// 	  $controller = _$controller_;
// 	  $rootScope = _$rootScope_;
// 	}));
  
// 	describe('$scope testing', function() {
// 	  it('tests if the notlist is an empty array', function() {
// 		var $scope = $rootScope.$new();
// 		var controller = $controller('formCtrl', { $scope: $scope });
// 		$scope.command="test4";
// 		var notificationlist=[];
// 		var x=notificationlist.length;
// 		console.log(x);
// 		var testlength=$scope.notlist.length;
// 		console.log($scope.notlist.length);
// 		console.log($scope.notlist);
// 		expect(testlength).toEqual(0);
// 	  });
// 	});

	
// });



describe('registerController', function() {
	beforeEach(module('registerapp'));
  
	var $controller, $rootScope;
  
	beforeEach(inject(function(_$controller_, _$rootScope_){
	  // The injector unwraps the underscores (_) from around the parameter names when matching
	  $controller = _$controller_;
	  $rootScope = _$rootScope_;
	}));
  
	describe('$scope testing', function() {
	  it('tests if grade is weak if length is less than or equal to 8 ', function() {
		var $scope = $rootScope.$new();
		var controller = $controller('formCtrl', { $scope: $scope });
		$scope.password = '12345678';
		$scope.username="test4";
		$scope.confirm="123456789";
		// console.log($scope.grade());
		expect($scope.grade()).toEqual('weak');
	  });
	  it('tests if grade is medium if length is less than or equal to 12 ', function() {
		var $scope = $rootScope.$new();
		var controller = $controller('formCtrl', { $scope: $scope });
		$scope.password = '123456789111';
		$scope.username="test4";
		expect($scope.grade()).toEqual('medium');
	  });
	  it('tests if grade is medium if length is greater than 12 ', function() {
		var $scope = $rootScope.$new();
		var controller = $controller('formCtrl', { $scope: $scope });
		$scope.password = '1234567891111';
		$scope.username="test4";
		expect($scope.grade()).toEqual('strong');
	  });
	});
});


describe('notifyappController', function() {
	beforeEach(module('notifyapp'));
  
	var $controller, $rootScope;
  
	beforeEach(inject(function(_$controller_, _$rootScope_){
	  // The injector unwraps the underscores (_) from around the parameter names when matching
	  $controller = _$controller_;
	  $rootScope = _$rootScope_;
	}));
  
	describe('$scope testing ', function() {
		it('tests if the notifyapp controller is working without errors', function() {
			var $scope = $rootScope.$new();
			var controller = $controller('formCtrl', { $scope: $scope });
			var notification1 = {
				"title": "Baby Monitor Notifications",
				"description": " Is this woaasd?"
			};
			$scope.notlist.push(notification1);
			expect($scope.notlist).toEqual([{
				"title": "Baby Monitor Notifications",
				"description": " Is this woaasd?"
			}]);
		  });
	});
});