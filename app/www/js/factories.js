angular.module('Gunt.factories', [])

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

.factory('level', function($http, appConfig, $injector) {
    return {
        checkanswer: function(check) {
            return $http({
                method: 'POST',
                url: appConfig.serverUrl + 'checkanswer',
                data: check,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        currentLevel: function(id) {
            return $http({
                method: 'POST',
                url: appConfig.serverUrl + 'register',
                data: {id: id},
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        },
        levelState: function(level) {
            return appConfig.levelname[level];
        },
        gotoLevel: function(id) {
            tempLevel=$injector.get('level');
            $state=$injector.get('$state');
            tempLevel.currentLevel(id)
            .success(function(data){
                if (data.code==0){
                    var togoto = tempLevel.levelState(data.message.level);
                    console.log(togoto);
                    $state.go(togoto);
                    // $state.go('app.start');
                }
            }).error(function(err){
                console.log(err);
            });
        }
    }
})

;
