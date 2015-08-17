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
    var user = appConfig.serverUrl + 'user/';
    return {
        login: function(loginData) {
            return $http({
                method: 'POST',
                url: user + 'login/',
                data: loginData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        },
        register: function(registerData) {
            console.log(registerData);
            return $http({
                method: 'POST',
                url: user + 'register/',
                data: registerData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }
    }
})

.factory('attendance', function($http, appConfig) {
    var attendance = appConfig.serverUrl + 'attendance/'
    return {
        view: function(id) {
            return $http({
                method: 'POST',
                url: attendance + 'view/',
                data: {
                    'id': id
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        },
        setAbsent: function(data) {
            return $http({
                method: 'POST',
                url: attendance + 'setAbsent/',
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        },
        setPresent: function(data) {
            return $http({
                method: 'POST',
                url: attendance + 'setPresent/',
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }
    }
});
