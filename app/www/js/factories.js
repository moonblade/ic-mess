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

.factory('user', function($http, appConfig, convert) {
    return {
        login: function(loginData) {
            loginData = convert.toget(loginData);
            return $http({
                method: 'POST',
                url: appConfig.serverUrl + 'user/login/',
                data: loginData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        },
        register: function(registerData) {
            registerData =  convert.toget(registerData);
            console.log(registerData);
            return $http({
                method: 'POST',
                url: appConfig.serverUrl + 'user/register/',
                data: registerData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }
    }
})

.factory('convert', function() {
    return {
        toget: function(data) {
            var string_ = JSON.stringify(data);
            string_ = string_.replace(/{/g, "");
            string_ = string_.replace(/}/g, "");
            string_ = string_.replace(/:/g, "=")
            string_ = string_.replace(/,/g, "&");
            string_ = string_.replace(/"/g, "");
            string_ = string_.replace(/\\/g, "");
            string_=encodeURI(string_);
            return string_;
        }
    }
})

;
