angular.module('Mess.controllers', ['Mess.factories'])

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

.controller('LoginCtrl', function($scope, $state, $timeout, $stateParams, $ionicPopup, $ionicLoading,$ionicPopover, $localstorage, user, $rootScope) {
    $scope.login = {};
    $scope.showLogin = false;

    $scope.loginPopover = $ionicPopover.fromTemplateUrl('templates/forms/loginForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.loginPopover = popover;
    });

    if ($localstorage.get('profile') != undefined)
    {
        // $state.go('app.calenderView');
        console.log("calender");
    }

    if ($localstorage.getObject('loginData') != undefined) {
        $scope.login = $localstorage.getObject('loginData');
    }

    $scope.register = function() {
        $state.go('app.register');
    }


    $scope.loginShow = function() {
        $scope.loginPopover.show();
        console.log("Show login Form");
    }

    $scope.loginSubmit = function() {
        $scope.loginPopover.hide();
        if ($scope.login.Remember) {
            $localstorage.set('loginData', JSON.stringify($scope.login));
        }
        $ionicLoading.show();
        var loginData = {
            email: $scope.login.Email,
            pass: $scope.login.Password
        }
        loginData  = JSON.stringify(loginData);
        user.login(loginData)
            .success(function(data) {
                $ionicLoading.hide();
                if (data.status == 1) {
                    console.log("logging in");
                    console.log(data.message);
                    $localstorage.set('profile', JSON.stringify(data.message));
                    $rootScope.loggedIn = true;
                    $state.go('app.searchresult');
                } else {
                    console.log(data.message);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            })
            .error(function(err) {
                console.log(err);
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Some error occured'
                });
                $ionicLoading.hide();
            });
    }
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

;
