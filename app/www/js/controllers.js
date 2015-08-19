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
        $localstorage.setObject('profile', {});
        $state.go('login');
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

.controller('LoginCtrl', function($scope, $state, $timeout, $stateParams, $ionicPopup, $ionicLoading, $ionicPopover, $localstorage, user, $rootScope) {
    $scope.login = {};
    $scope.showLogin = false;

    $scope.loginPopover = $ionicPopover.fromTemplateUrl('templates/forms/loginForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.loginPopover = popover;
    });

    if ($localstorage.get('profile') != undefined && $localstorage.get('profile') != '{}') {
        $state.go('app.calender');
        console.log("calender");
    }

    if ($localstorage.getObject('loginData') != undefined) {
        $scope.login = $localstorage.getObject('loginData');
    }

    $scope.register = function() {
        $state.go('register');
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
        loginData = JSON.stringify(loginData);
        user.login(loginData)
            .success(function(data) {
                $ionicLoading.hide();
                if (data.status == 1) {
                    console.log("logging in");
                    console.log(data.message);
                    $localstorage.set('profile', JSON.stringify(data.message));
                    $rootScope.loggedIn = true;
                    $state.go('app.calender');
                } else {
                    console.log(data.message);
                    console.log(data);
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

.controller('RegisterCtrl', function($scope, $state, $ionicPopup, $ionicLoading, $http, $templateCache, $stateParams, $timeout, user) {
    // Set Header
    $scope.isExpanded = false;
    $scope.user = {};
    $scope.submit = function() {
        $ionicLoading.show();
        if ($scope.user.Password != $scope.user.ConfPassword) {
            var alertPopup = $ionicPopup.alert({
                title: 'Error',
                template: 'Passwords don\'t match'
            });
        } else {
            var sendData = $scope.user;
            user.register(sendData)
                .success(function(data) {
                    console.log(data);
                    if (data.status == 1) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Success',
                            template: 'You have been successfully registered'
                        });
                        alertPopup.then(function(res) {
                            $state.go('login');
                        });
                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error',
                            template: data.message
                        });
                    }
                }).error(function(err) {
                    console.log(err);
                }).then(function() {
                    $ionicLoading.hide();
                });

        }

    }

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

.controller('CalenderCtrl', function($scope, $state, $localstorage, $ionicLoading, $ionicPopup, attendance, $rootScope) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    $rootScope.messStatus = 0;
    $rootScope.messString = "";
    $scope.attendance = {};
    $scope.profile = $localstorage.getObject('profile');
    console.log($scope.profile);
    $scope.view = function() {
        $ionicLoading.show();
        attendance.view($scope.profile.id)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    var today = new Date();
                    // generally allowed to edit tomorrows, before today eight-thirty
                    today.setDate(today.getDate() + 1);
                    console.log(today);
                    for (i in data.message) {
                        // console.log(i, data.message[i]);
                        var tempDate = new Date(i);
                        tempDate.setHours(20);
                        tempDate.setMinutes(30);
                        tempDate.setSeconds(0);
                        var stringDate = {};
                        tempDate;
                        stringDate.date = i;
                        stringDate.dateString = tempDate.toDateString();
                        stringDate.present = data.message[i];
                        if (tempDate > today)
                            stringDate.editable = 1;
                        else
                            stringDate.editable = 0;
                        $scope.attendance[i] = stringDate;
                    }
                } else {
                    $rootScope.messStatus = data.status;
                    $rootScope.messString = data.message;
                    $ionicLoading.hide();
                    $state.go('app.dashboard');
                }
            }).error(function(err) {
                console.log(err);
            }).then(function() {
                $ionicLoading.hide();
            });
    }
    $scope.view();

    $scope.setAbsent = function(date) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Are you sure?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                $ionicLoading.show();
                console.log("Mark Absent On " + date);
                var data = {};
                data.id = $scope.profile.id;
                data.date = date;
                attendance.setAbsent(data)
                    .success(function(data) {
                        if (data.status == 1) {
                            $scope.view();
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Error',
                                template: data.message
                            })
                        }
                    }).error(function(err) {
                        console.log(err);
                    }).then(function() {
                        $ionicLoading.hide();
                    });

            } else {
                // confirmPopup.hide();
            }
        });
    }

    $scope.setPresent = function(date) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Are you sure?'
        });
        confirmPopup.then(function(res) {
            if (res) {
                $ionicLoading.show();
                console.log("Mark Present On " + date);
                var data = {};
                data.id = $scope.profile.id;
                data.date = date;
                attendance.setPresent(data)
                    .success(function(data) {
                        if (data.status == 1) {
                            $scope.view();
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Error',
                                template: data.message
                            })
                        }
                    }).error(function(err) {
                        console.log(err);
                    }).then(function() {
                        $ionicLoading.hide();
                    });
            }
        });

    }

    ionic.material.ink.displayEffect();

})

.controller('DashBoardCtrl', function($scope, $ionicLoading, $rootScope, $ionicPopup,$localstorage, mess, user) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.details = {};
    $scope.costDetails = {};
    $scope.fabShown = false;
    $scope.nodata = false;
    $scope.profile = $localstorage.getObject('profile');

    $scope.getDetailsCurrent = function() {
        $ionicLoading.show();
        mess.getDetailsCurrent()
            .success(function(data) {
                if (data.status == 1) {
                    console.log(data.message);
                    $scope.details = data.message;
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error ' + JSON.stringify(err)
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.details.startDate = new Date($scope.details.start);
                $scope.details.endDate = new Date($scope.details.start);
                $scope.details.endDate.setDate($scope.details.startDate.getDate() + $scope.details.no_of_days);
                $scope.details.endDate = new Date($scope.details.endDate).toDateString();
                $scope.details.startDate = new Date($scope.details.startDate).toDateString();
            });
        $scope.dummy={
            'id': $scope.profile.id
        }
        user.getCostDetails($scope.dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    console.log(data.message);
                    $scope.costDetails = data.message;
                    console.log($scope.costDetails);
                } else {
                    if(data.status==2)
                        $scope.fabShown = true;
                    $scope.nodata=true;
                    $scope.message = data.message;
                }
            }).error(function(err) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error '
                });
            });

    }
    $scope.getDetailsCurrent();



    ionic.material.ink.displayEffect();
});
