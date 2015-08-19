// Ionic Mess App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'Mess' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'Mess.controllers' is found in controllers.js
angular.module('Mess', ['ionic', 'Mess.controllers', 'Mess.factories'])

.run(function($ionicPlatform) {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
    }
})

.value('appConfig', {
    serverUrl: 'http://localhost/working/mess/api/',
    // serverUrl: 'http://icccmess-moonblade.rhcloud.com/api/',
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    // Turn off caching for demo simplicity's sake
    $ionicConfigProvider.views.maxCache(0);

    /*
    // Turn off back button text
    $ionicConfigProvider.backButton.previousTitleText(false);
    */

    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    })


    .state('login', {
        url: '/login',
        templateUrl: 'templates/login/login.html',
        controller: 'LoginCtrl'
    })

    .state('register', {
        url: '/register',
        templateUrl: 'templates/register/register.html',
        controller: 'RegisterCtrl'
    })

    .state('app.calender', {
        url: '/calender',
        views: {
            'menuContent': {
                templateUrl: 'templates/mess/calender.html',
                controller: 'CalenderCtrl'
            },
            'fabContent': {
                template: '',
                controller: ''
            }
        }
    })

    .state('app.dashboard', {
            url: '/dashboard',
            views: {
                'menuContent': {
                    templateUrl: 'templates/mess/dashBoard.html',
                    controller: 'DashBoardCtrl'
                },
                'fabContent': {
                    template: '<button ng-if="fabShown" id="fab-add-mess" class="button button-fab button-fab-bottom-right button-energized-900"><i class="icon ion-plus"></i></button>',
                    controller: 'DashBoardCtrl'
                }
            }
        })
        // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});
