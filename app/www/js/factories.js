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
            return $http({
                method: 'POST',
                url: user + 'register/',
                data: registerData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        },
        getCostDetails: function(data) {
            return $http({
                method: 'POST',
                url: user + 'getCostDetails/',
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }
    }
})

.factory('attendance', function($http, appConfig, generic) {
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
})

.factory('mess', function($http, appConfig,generic) {
    var mess = appConfig.serverUrl + 'mess/'
    return {
        getDetailsCurrent: function() {
            return generic.generic(mess + 'getDetails/');
        }
    }
})

.factory('admin', function($http, appConfig, generic) {
    var admin = appConfig.serverUrl + 'admin/'
    return {
        getCount: function(data) {
            return generic.generic(admin + 'getCount',data);
        },
        getPending: function(data) {
            return generic.generic(admin + 'viewPending/', data);
        },
        changeStatus: function(data,status) {
            if(status==undefined)
                status="";
            return generic.generic(admin + 'changeStatus/'+status, data);
        }
    }
})

.factory('generic', function($http) {
    return {
        generic: function(url, data) {
            return $http({
                method: 'POST',
                url: url,
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

        }
    }
});
