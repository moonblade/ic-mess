// Ionic Gunt App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'Gunt' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'Gunt.controllers' is found in controllers.js
angular.module('Gunt', ['ionic', 'Gunt.controllers', 'ngOpenFB', 'Gunt.factories', 'Gunt.alpha'])

.run(function($ionicPlatform, ngFB) {
    $ionicPlatform.ready(function() {
        ngFB.init({
            appId: '1573565049528271'
        });
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.value('appConfig', {
    serverUrl: 'http://localhost:3000/',
    levelname: {
        0: 'app.start',
        1: 'app.copperKey',
        2: 'app.firstGate',
        3: 'app.jadeKey',
        4: 'app.secondGate',
        5: 'app.crystalKey',
        6: 'app.crystalKeySplit',
        7: 'app.crystalKeySplit',
        8: 'app.crystalKeySplit',
        9: 'app.thirdGate',
        10: 'app.bonusRoom'
    }
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
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })

    .state('app.profile', {
        url: '/profile',
        views: {
            'menuContent': {
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl'
            },
            'fabContent': {
                template: '<button id="fab-profile" class="button button-fab button-fab-bottom-right button-energized-900"><i class="icon ion-plus"></i></button>',
                controller: function($timeout) {
                    /*$timeout(function () {
                        document.getElementById('fab-profile').classList.toggle('on');
                    }, 800);*/
                }
            }
        }
    })

    .state('app.start', {
        url: '/start',
        views: {
            'menuContent': {
                templateUrl: 'templates/start.html',
                controller: 'startCtrl'
            },
            'fabContent': {
                template: '',
                controller: ''
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});
