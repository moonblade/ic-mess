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

.factory('user', function($http, appConfig, generic) {
    var user = appConfig.serverUrl + 'user/';
    return {
        login: function(data) {
            return generic.generic(user + 'login/', data);
        },
        register: function(data) {
            return generic.generic(user + 'register/', data);
        },
        getCostDetails: function(data) {
            return generic.generic(user + 'getCostDetails/', data);
        },
        editProfile: function(data) {
            return generic.generic(user + 'editProfile/', data);
        },
        changePassword: function(data) {
            return generic.generic(user + 'changePassword/', data);
        },
        sendFeedback: function(data) {
            return generic.generic(user + 'sendFeedback/', data);
        },
        enroll: function(id) {
            return generic.generic(user + 'enroll/' + id);
        }
    }
})

.factory('attendance', function($http, appConfig, generic) {
    var attendance = appConfig.serverUrl + 'attendance/'
    return {
        view: function(data) {
            return generic.generic(attendance + 'view/', data);
        },
        setAbsent: function(data) {
            return generic.generic(attendance + 'setAbsent/', data);
        },
        setPresent: function(data) {
            return generic.generic(attendance + 'setPresent/', data);
        }
    }
})

.factory('mess', function($http, appConfig, generic) {
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
            return generic.generic(admin + 'getCount', data);
        },
        getPending: function(data) {
            return generic.generic(admin + 'viewPending/', data);
        },
        changeStatus: function(data, status) {
            if (status == undefined)
                status = "";
            return generic.generic(admin + 'changeStatus/' + status, data);
        },
        editMess: function(data, mid) {
            if (mid == undefined)
                mid = "";
            return generic.generic(admin + 'editMess/' + mid, data);
        },
        createMess: function(data, nod) {
            if (nod == undefined)
                nod = "";
            return generic.generic(admin + 'createMess/' + nod, data);
        },
        getNames: function(data) {
            return generic.generic(admin + 'getNamesForSec/', data);
        },
        getAllCost: function(data) {
            return generic.generic(admin + 'getAllCost/', data);
        },
        addSec: function(data) {
            return generic.generic(admin + 'addMessSec/', data);
        },
        deleteSec: function(data) {
            return generic.generic(admin + 'deleteSec/', data);
        },
        getMDs: function(data) {
            return generic.generic(admin + 'getUsersGreater/2', data);
        },
        addMD: function(data) {
            return generic.generic(admin + 'changeMD/3', data);
        },
        deleteMD: function(data) {
            return generic.generic(admin + 'changeMD/1', data);
        },
        getMDCandidates: function(data) {
            return generic.generic(admin + 'getUsersGreater/0/3', data);
        },
        getDates: function(data) {
            return generic.generic(admin + 'getDates/', data);
        },
        addMessLeave: function(data) {
            return generic.generic(admin + 'addMessLeave/', data);
        },
        removeMessLeave: function(data) {
            return generic.generic(admin + 'removeMessLeave/', data);
        },
        inmateDetails: function(data) {
            return generic.generic(admin + 'inmateDetails/', data);
        },
        inmateEditCost: function(data,id,op) {
            console.log(admin + 'inmateEditCost/' + id+'/'+op);
            return generic.generic(admin + 'inmateEditCost/'+ id+'/'+op, data);
        },
        


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
