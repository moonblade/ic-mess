angular.module('Mess.controllers', ['Mess.factories'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout, $state, $localstorage) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;
    $scope.profile = $localstorage.getObject('profile');

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
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
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
                    $ionicLoading.hide();
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
                $ionicLoading.hide();
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
                        $ionicLoading.hide();
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
                        $ionicLoading.hide();
                        console.log(err);
                    }).then(function() {
                        $ionicLoading.hide();
                    });
            }
        });

    }

    ionic.material.ink.displayEffect();

})

.controller('DashBoardCtrl', function($scope, $ionicLoading, $rootScope, $ionicPopup, $ionicPopover, $localstorage, mess, user, $window) {
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


    $scope.call = function(number) {
        console.log("calling " + number);
        $window.open('tel:' + number);
    }

    $scope.getDetailsCurrent = function() {
        $ionicLoading.show();
        mess.getDetailsCurrent()
            .success(function(data) {
                if (data.status == 1) {
                    console.log(data.message);
                    $scope.details = data.message;
                    $scope.details.establishment = parseInt($scope.details.establishment);
                    $scope.details.cost_per_day = parseInt($scope.details.cost_per_day);
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error ' + JSON.stringify(err)
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.details.startDate = new Date($scope.details.start);
                $scope.details.endDate = new Date($scope.details.start);
                $scope.details.endDate.setDate($scope.details.startDate.getDate() + parseInt($scope.details.no_of_days));
                console.log($scope.details.endDate);
                $scope.details.endDate = new Date($scope.details.endDate).toDateString();
                $scope.details.startDate = new Date($scope.details.startDate).toDateString();
            });
        $scope.dummy = {
            'id': $scope.profile.id
        }
    }
    $scope.getDetailsCurrent();

    $scope.getCostDetails = function() {
        $ionicLoading.show();
        user.getCostDetails($scope.dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.costDetails = data.message;
                } else {
                    if (data.status == 2)
                        $scope.fabShown = true;
                    $scope.nodata = true;
                    $scope.message = data.message;
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error '
                });
            }).then(function() {
                $ionicLoading.hide();
            });
    }
    $scope.getCostDetails();

    $scope.editMessPopover = $ionicPopover.fromTemplateUrl('templates/forms/editMessForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.editMessPopover = popover;
    });

    $scope.showEditMessForm = function() {
        if ($scope.profile.level > 2)
            $scope.editMessPopover.show();
    }

    $scope.editMess = function() {
        var dummy = {
            'id': $scope.profile.id,
            'establishment': $scope.details.establishment,
            'cost_per_day': $scope.details.cost_per_day
        };

        $ionicLoading.show();
        admin.editMess(dummy, $scope.details.mid)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getMessCost();
                } else {
                    // $ionicLoading.hide();
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $scope.editMessPopover.hide();
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $scope.editMessPopover.hide();
                $ionicLoading.hide();
            });
    }


    ionic.material.ink.displayEffect();
})

.controller('AdminCtrl', function($scope, $localstorage, $ionicPopup, $ionicLoading, admin, $ionicPopover, mess) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.countDate = [];
    $scope.fabShown = false;
    $scope.nodata = false;
    $scope.profile = $localstorage.getObject('profile');
    $scope.tomorrowCount = 0;
    $scope.personList = {};
    $scope.details = {};
    $scope.expandPendingCard = false;
    $scope.showPendingCard = false;
    $scope.expandAcceptedCard = false;
    $scope.showAcceptedCard = false;
    $scope.expandBarredCard = false;
    $scope.showBarredCard = false;

    $scope.editMessPopover = $ionicPopover.fromTemplateUrl('templates/forms/editMessForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.editMessPopover = popover;
    });


    var today = new Date();
    var tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    $scope.getDetailsCurrent = function(date) {
        $ionicLoading.show();
        var dummy = {
            'id': $scope.profile.id,
            'date': date
        }
        admin.getCount(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.count += 1;
                    var toPush = {};
                    toPush.String = date.toDateString();
                    toPush.count = data.message;
                    toPush.relative = "Today";
                    if (date == tomorrow) {
                        toPush.relative = "Tomorrow";
                        $scope.tomorrowCount = data.message;
                    }
                    $scope.countDate.push(toPush);
                } else {
                    if (date == tomorrow)
                        $scope.nodata = true;
                    $scope.message = data.message;
                }
            }).error(function(err) {
                $ionicLoading.hide();
                console.log(err);
            }).then(function() {
                $ionicLoading.hide();
            });
    }
    $scope.getDetailsCurrent(tomorrow);
    $scope.getDetailsCurrent(today);

    $scope.stateExists = function(list, status) {
        var a = 0;
        list.forEach(function(person) {
            if (person.status == status) {
                a = a + 1;
            }
        });
        return (a);
    }

    $scope.getPending = function() {
        $ionicLoading.show();
        var sendData = {
            'id': $scope.profile.id
        }
        admin.getPending(sendData)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.personList = data.message;
                    var tempCount;
                    if ($scope.stateExists($scope.personList, 0))
                        $scope.showPendingCard = true;
                    if ($scope.stateExists($scope.personList, 1))
                        $scope.showAcceptedCard = true;
                    if ($scope.stateExists($scope.personList, 2))
                        $scope.showBarredCard = true;
                }
            }).error(function(err) {
                $ionicLoading.hide();
                console.log(err);
            }).then(function() {
                $ionicLoading.hide();
            });

    }
    $scope.getPending();

    $scope.changeStatus = function(id, name, status) {
        var question = 'Accept ' + name + '?';
        if (status == 2)
            var question = 'Bar ' + name + '?';
        var confirm = $ionicPopup.confirm({
            title: 'Confirm',
            template: question
        }).then(function(res) {
            if (res) {
                $ionicLoading.show();
                var dummy = {
                    'id': $scope.profile.id,
                    'acceptId': id
                }
                admin.changeStatus(dummy, status)
                    .success(function(data) {
                        console.log(data);
                        if (data.status == 1) {
                            $scope.getPending();
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Error',
                                template: data.message
                            });
                        }
                    }).error(function(err) {
                        $ionicLoading.hide();
                        console.log(err);
                    }).then(function() {
                        $ionicLoading.hide();
                    });
            }
        });
    }

    $scope.showEditMessForm = function() {
        $scope.editMessPopover.show();
    }

    $scope.editMess = function() {
        var dummy = {
            'id': $scope.profile.id,
            'establishment': $scope.details.establishment,
            'cost_per_day': $scope.details.cost_per_day
        };

        $ionicLoading.show();
        admin.editMess(dummy, $scope.details.mid)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getMessCost();
                } else {
                    // $ionicLoading.hide();
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $scope.editMessPopover.hide();
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $scope.editMessPopover.hide();
                $ionicLoading.hide();
            });
    }
});
