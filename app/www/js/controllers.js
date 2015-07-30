angular.module('Gunt.controllers', ['Gunt.factories', 'ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout, $state, $localstorage) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    $scope.logout = function() {
        $localstorage.setObject('player', {});
        $state.go('app.login');
    };
    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function() {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function(bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function(location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function() {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function() {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function() {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function() {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
})

.controller('LoginCtrl', function($scope, $state, $timeout, $stateParams, $ionicPopup, $ionicLoading, $localstorage, ngFB, login, level) {
    $scope.player = $localstorage.getObject('player');
    if ($scope.player != {}) {
        level.gotoLevel($scope.player.id);
    }
    $scope.fbLogin = function() {
        $ionicLoading.show();
        // ngFB.login({
        //     scope: 'email'
        // }).then(
        //     function(response) {
        //         if (response.status === 'connected') {
        //             console.log('Facebook login succeeded');
        //             ngFB.api({
        //                 path: '/me',
        //                 params: {
        //                     fields: 'id,name,email'
        //                 }
        //             }).then(function(player) {
        //                     $scope.player = player;
        //                     console.log($scope.player);
        //                     var alertPopup = $ionicPopup.alert({
        //                         title: 'profile',
        //                         template: JSON.stringify($scope.player)
        //                     });
        //                     $ionicLoading.hide();
        //                     login.login($scope.player)
        //                         .success(function(data) {
        //                             console.log(data);
        //                             if (data.code == 0) {
        //                                 $localstorage.setObject('player', data.message);
        //                                 level.gotoLevel(data.message.id);
        //                             } else if (data.code == 3) {
        //                                 var alertPopup = $ionicPopup.alert({
        //                                     title: 'Failed',
        //                                     template: 'The Email is already in use' + '</br> Error code : ' + data.code
        //                                 });
        //                             } else {
        //                                 var alertPopup = $ionicPopup.alert({
        //                                     title: 'Failed',
        //                                     template: 'Some Error Occured' + '</br> Error code : ' + data.code
        //                                 });
        //                             }
        //                         }).error(function(err) {
        //                             console.log(err);
        //                         }).then(function() {
        //                             $ionicLoading.hide();
        //                         });
        //                 },
        //                 function(error) {
        //                     alert('Facebook error: ' + error.error_description);
        //                 });
        //         } else {
        //             alert('Facebook login failed');
        //         }
        //     });

            facebookConnectPlugin.login(['public_profile', 'email'], 
                function (response) { 
                    // $localstorage.set('login_status','success');
                    var alertPopup = $ionicPopup.alert({
                        title: 'login',
                        template: JSON.stringify(response)
                    });
                    console.log(response);
                    $state.go('app.home', {}, {location: "replace", reload: true});
                    $ionicLoading.hide();
                }, 
                function (error) { 
                    ionicToast.show("Some error occured! Please try again.","middle",false,2500);
                });
    };

    ionic.material.ink.displayEffect();
})

.controller('ProfileCtrl', function($scope, $stateParams, $timeout) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    // Set Motion
    $timeout(function() {
        ionic.material.motion.slideUp({
            selector: '.slide-up'
        });
    }, 300);

    $timeout(function() {
        ionic.material.motion.fadeSlideInRight({
            startVelocity: 3000
        });
    }, 700);

    // Set Ink
    ionic.material.ink.displayEffect();
})

.controller('startCtrl', function($scope, $state, $stateParams, $ionicLoading, $localstorage, $timeout, level) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.player = {};
    if ($localstorage.getObject('player') != undefined)
        $scope.player = $localstorage.getObject('player');
    console.log($scope.player);
    $scope.check = {};
    $scope.check.id = $scope.player.id;
    $scope.placeholder = "Enter Password";
    $scope.submit = function() {
        $ionicLoading.show();
        level.checkanswer($scope.check)
            .success(function(data) {
                if (data.code == 0) {
                    console.log("correct answer");
                    level.gotoLevel($scope.player.id);
                } else if (data.code == 13) {
                    console.log("wrong answer");
                } else {
                    console.log("error" + data.code + " : " + data.message);
                }
            }).error(function(err) {
                console.log(err);
            }).then(function() {
                $ionicLoading.hide();
            });
    }
});
