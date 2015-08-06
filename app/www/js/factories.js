angular.module('Mess.factories', [])

.factory('$localstorage', ['$window', function($window) {
    return {
        set: function(key, value) {
            $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
}])

.factory('user', function($http, appConfig) {
    return {
        login: function(loginData) {
            return $http({
                method: 'POST',
                url: appConfig.userUrl + 'login/',
                data: loginData,
                headers: {
                   'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }
    }
})


;
