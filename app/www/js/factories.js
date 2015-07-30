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

.factory('login', function($http, appConfig) {
    return {
        login: function(player) {
            return $http({
                method: 'POST',
                url: appConfig.serverUrl + 'register/',
                data: player,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
})


;
