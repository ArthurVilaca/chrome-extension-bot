function renderStatus(statusText) {
	document.getElementById('status').textContent = statusText;
}

var app = angular.module('app', []);
app.controller('AppCtrl', ['$scope', '$rootScope', '$http', function($scope, $rootScope, $http) {
	$scope.loginData = {};
	$scope.currentPage = 'login';

	$scope.login = function() {
		$http.post('https://gestao.srm.systems/idealmilhas/backend/application/index.php?rota=/login',
			'email=' + $scope.loginData.email + '&password=' + $scope.loginData.password + '&hashId=5a9b0fde419b522a8b9baede73811369',
			{ headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'} })
			.then(function sucessCallback(data) {
				var response = data.data;
				if(response.message.type == 'S') {
					$http.defaults.headers.common['hashId'] = response.dataset[0].hashId;
					$scope.currentPage = 'data';
					$scope.loadData();
				} else {
					renderStatus(response.message.text);
				}

			}, function errorCallback(response){
				renderStatus(response.message.text);
				console.log(response);
			});
	};

	$scope.loadData = function() {
		$http.post('https://gestao.srm.systems/idealmilhas/backend/application/index.php?rota=/loadOrder', {})
			.then(function sucessCallback(data) {
				var response = data.data;
				renderStatus('Vendas hoje: ' + response.dataset.length);
				
			}, function errorCallback(response){
				renderStatus(response.message.text);
				$scope.currentPage = 'login';
				console.log(response);
			});
	};

	var init = function() {

		console.log(chrome.storage);
		chrome.tabs.getSelected(null, function(tab) {
			console.log(tab);
		});

		var login = window.localStorage.getItem('login');
		if(login) {
			// already logged
			$scope.loginData = JSON.parse(login);
			$http.defaults.headers.common['hashId'] = $scope.loginData.hashId;
			$scope.currentPage = 'data';
			$scope.loadData();
		}
	}

	$http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	return init();
}]);
