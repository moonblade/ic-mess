angular.module('Mess.controllers', ['Mess.factories', 'ngCordova'])

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
        var dummy = {
            'id': $scope.profile.id
        }
        attendance.view(dummy)
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

.controller('DashBoardCtrl', function($scope, $ionicLoading, $rootScope, $ionicPopup, $ionicPopover, $localstorage, mess, user, admin, $window) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.details = {};
    $scope.costDetails = {};
    $scope.nodata = false;
    $scope.profile = $localstorage.getObject('profile');
    $scope.addSecData = [];
    $scope.showFab = false;
    $scope.searchText = null;

    $scope.call = function(number) {
        console.log("calling " + number);
        $window.open('tel:' + number);
    }

    $scope.enroll = function() {
        var confirm = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Are you sure you want to enroll'
        }).then(function(res) {
            if (res) {
                $ionicLoading.show();
                user.enroll($scope.profile.id)
                    .success(function(data) {
                        console.log(data);
                        if (data.status == 1) {
                            var alert = $ionicPopup.alert({
                                title: 'Success',
                                template: data.message
                            });
                        } else {
                            var alert = $ionicPopup.alert({
                                title: 'Error',
                                template: data.message
                            });
                        }
                    }).error(function(err) {
                        console.log(err);
                        var alert = $ionicPopup.alert({
                            title: 'Error',
                            template: 'Connection Error'
                        });
                    }).then(function() {
                        $ionicLoading.hide();
                    });
            }
        });
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
                    $scope.details.no_of_days = parseInt($scope.details.no_of_days);
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
                $scope.details.endDate.setDate($scope.details.startDate.getDate() + parseInt($scope.details.no_of_days) - 1);
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
                        $scope.showFab = true;
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


    $scope.addSecPopover = $ionicPopover.fromTemplateUrl('templates/forms/addMessSecForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.addSecPopover = popover;
    });

    $scope.deleteSecPopover = $ionicPopover.fromTemplateUrl('templates/forms/deleteSecForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.deleteSecPopover = popover;
    });

    $scope.showDeleteSecPopover = function() {
        $scope.deleteSecPopover.show();
    }

    $scope.deleteSec = function() {
        $scope.deleteSecPopover.hide();
        $ionicLoading.show();
        $scope.deleteSecData = [];
        $scope.details.sec.forEach(function(list) {
            if (list.checked)
                $scope.deleteSecData.push(list.id);
        });
        var dummy = {
            'id': $scope.profile.id,
            'sec[]': $scope.deleteSecData
        }
        admin.deleteSec(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getDetailsCurrent();
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.deleteSecPopover.hide();
            });

    }

    $scope.addSec = function() {
        $ionicLoading.show();
        $scope.addSecData = [];
        $scope.nameList.forEach(function(list) {
            if (list.checked)
                $scope.addSecData.push(list.id);
        });
        var dummy = {
            'id': $scope.profile.id,
            'sec[]': $scope.addSecData
        }
        admin.addSec(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getDetailsCurrent();
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.addSecPopover.hide();
            });
    }

    $scope.showAddSecPopover = function() {
        $ionicLoading.show();
        var dummy = {
            'id': $scope.profile.id
        };
        admin.getNames(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.nameList = data.message;
                    if ($scope.profile.level > 2)
                        $scope.addSecPopover.show();
                    console.log($scope.nameList);
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                console.log(err);
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
            })
    }

    $scope.showEditMessForm = function() {
        if ($scope.profile.level > 2)
            $scope.editMessPopover.show();
    }

    $scope.editMess = function() {
        var dummy = {
            'id': $scope.profile.id,
            'establishment': $scope.details.establishment,
            'cost_per_day': $scope.details.cost_per_day,
            'no_of_days': $scope.details.no_of_days
        };

        $ionicLoading.show();
        admin.editMess(dummy, $scope.details.mid)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getCostDetails();
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

.controller('AdminCtrl', function($scope, $ionicPlatform, $cordovaFileTransfer, $localstorage, $window, $ionicPopup, $ionicLoading, admin, $ionicPopover, mess, appConfig) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.countDate = [];
    $scope.nodata = false;
    $scope.profile = $localstorage.getObject('profile');
    $scope.tomorrowCount = 0;
    $scope.personList = {};
    $scope.details = {};
    $scope.createMessDetails = {};
    $scope.nameList = {};
    $scope.searchText = null;

    $scope.init = function() {
        $scope.showInmateCard = false;
        $scope.checkStatus = 0;
        $scope.title = "Pending";

        $scope.MDList = {};
        $scope.showMDList = false;
        $scope.mdCandidateList = {};

        $scope.dates = {};
        $scope.datesString = [];
        $scope.showDateCard = false;
        $scope.dateCanditates = {};
    }
    $scope.init();
    // ionic.material.ink.displayEffect();

    $scope.createMessPopover = $ionicPopover.fromTemplateUrl('templates/forms/createMessForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.createMessPopover = popover;
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

    $scope.getMDs = function() {
        // if (!$scope.showMDList) {

        $scope.init();
        var dummy = {
            'id': $scope.profile.id
        }
        $ionicLoading.show();
        admin.getMDs(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.MDList = data.message;
                    $scope.showMDList = true;
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                console.log(err);
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
            })
            // }
    }

    $scope.download = function(url) {
        var filename = url.split("/").pop();
        var targetPath = filename;
        var trustHosts = true
        var options = {};
        $ionicPlatform.ready(function() {
            console.log("downloading");
            $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                .then(function(result) {
                    // Success!
                }, function(err) {
                    // Error
                }, function(progress) {
                    $timeout(function() {
                        $scope.downloadProgress = (progress.loaded / progress.total) * 100;
                    })
                });

        });
    }

    $scope.getAllCost = function() {
        $ionicLoading.show();
        var dummy = {
            'id': $scope.profile.id
        };
        admin.getAllCost(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    var confirm = $ionicPopup.confirm({
                        title: 'Success',
                        template: 'Click ok to download'
                    }).then(function(res) {
                        if (res) {
                            var csvLocation = appConfig.serverUrl + data.message;
                            console.log("goto : " + csvLocation);
                            $window.open(encodeURI(csvLocation), '_system');
                            // $scope.download(csvLocation);
                        }
                    });
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                console.log(err);
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: data.message
                });

            }).then(function() {
                $ionicLoading.hide();
            });
    }

    $scope.getPending = function() {
        // if (!$scope.showInmateCard) {

        $scope.init();
        $ionicLoading.show();
        var sendData = {
            'id': $scope.profile.id
        }
        admin.getPending(sendData)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.personList = data.message;
                    $scope.showInmateCard = true;
                } else {
                    $scope.noStudentExists = true;
                }
            }).error(function(err) {
                $ionicLoading.hide();
                console.log(err);
            }).then(function() {
                $ionicLoading.hide();
            });
        // }
    }

    $scope.changeStatus = function(id, name, status) {
        var ids = [];
        ids.push(id);
        if (status == 3)
            status = 1;
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
                    'acceptId[]': ids
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

    $scope.showCreateMessForm = function() {
        $scope.createMessDetails.startDate = new Date();
        $scope.createMessDetails.no_of_days = 30;
        console.log($scope.createMessDetails);
        if ($scope.profile.level > 2)
            $scope.createMessPopover.show();
    }

    $scope.createMess = function() {
        var dummy = {
            'id': $scope.profile.id,
            'start': $scope.createMessDetails.startDate
        };
        console.log(dummy);
        $ionicLoading.show();
        admin.createMess(dummy, $scope.createMessDetails.no_of_days)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    var alert = $ionicPopup.alert({
                        title: 'Success',
                        template: data.message
                    });
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $scope.createMessPopover.hide();
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $scope.createMessPopover.hide();
                $ionicLoading.hide();
            });
    }




    $scope.addMDPopover = $ionicPopover.fromTemplateUrl('templates/forms/addMDForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.addMDPopover = popover;
    });

    $scope.deleteMDPopover = $ionicPopover.fromTemplateUrl('templates/forms/deleteMDForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.deleteMDPopover = popover;
    });

    $scope.showDeleteMDPopover = function() {
        $scope.deleteMDPopover.show();
    }

    $scope.deleteMD = function() {
        $scope.deleteMDPopover.hide();
        $ionicLoading.show();
        $scope.deleteMDData = [];
        $scope.MDList.forEach(function(list) {
            if (list.checked)
                $scope.deleteMDData.push(list.id);
        });
        var dummy = {
            'id': $scope.profile.id,
            'md[]': $scope.deleteMDData
        }
        admin.deleteMD(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getMDs();
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.deleteMDPopover.hide();
            });

    }

    $scope.addMD = function() {
        $ionicLoading.show();
        $scope.addMDData = [];
        $scope.mdCandidateList.forEach(function(list) {
            if (list.checked)
                $scope.addMDData.push(list.id);
        });
        var dummy = {
            'id': $scope.profile.id,
            'md[]': $scope.addMDData
        }
        admin.addMD(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getMDs();
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.addMDPopover.hide();
            });
    }

    $scope.showAddMDPopover = function() {
        $ionicLoading.show();
        var dummy = {
            'id': $scope.profile.id
        };
        admin.getMDCandidates(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.mdCandidateList = data.message;
                    if ($scope.profile.level > 2)
                        $scope.addMDPopover.show();
                    console.log($scope.mdCandidateList);
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                console.log(err);
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
            })
    }


    $scope.getDates = function() {
        // if (!$scope.showDateCard) {
        $scope.init();
        var dummy = {
            'id': $scope.profile.id
        }
        $ionicLoading.show();
        admin.getDates(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.dates = data.message;
                    $scope.dates.forEach(function(list) {
                        var temp = new Date(list.date).toDateString();
                        list.dateString = temp;
                    });
                    $scope.showDateCard = true;
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                console.log(err);
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
            })
            // }
    }


    $scope.addDatePopover = $ionicPopover.fromTemplateUrl('templates/forms/addDateForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.addDatePopover = popover;
    });

    $scope.deleteDatePopover = $ionicPopover.fromTemplateUrl('templates/forms/deleteDateForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.deleteDatePopover = popover;
    });

    $scope.showDeleteDatePopover = function() {
        $scope.deleteDatePopover.show();
    }

    $scope.deleteDate = function() {
        $scope.deleteDatePopover.hide();
        $ionicLoading.show();
        $scope.deleteDateData = [];
        $scope.dates.forEach(function(list) {
            if (list.checked && list.valid == 2)
                $scope.deleteDateData.push(list.date);
        });
        var dummy = {
            'id': $scope.profile.id,
            'date[]': $scope.deleteDateData
        }
        console.log(dummy);
        admin.removeMessLeave(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getDates();
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.deleteDatePopover.hide();
            });

    }

    $scope.addDates = function() {
        $ionicLoading.show();
        $scope.addDateData = [];
        $scope.dates.forEach(function(list) {
            if (list.checked && list.valid == 1)
                $scope.addDateData.push(list.date);
        });
        var dummy = {
            'id': $scope.profile.id,
            'date[]': $scope.addDateData
        }
        console.log(dummy);
        admin.addMessLeave(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.getDates();
                } else {
                    var alert = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alert = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.addDatePopover.hide();
            });
    }

    $scope.showAddDatePopover = function() {
        $scope.addDatePopover.show();
    }


})

.controller('ProfileCtrl', function($scope, $localstorage, $ionicPopover, $ionicLoading, user, $ionicPopup) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.user = {};
    $scope.profile = $localstorage.getObject('profile');
    $scope.profile.dobString = new Date($scope.profile.dob).toDateString();

    $scope.editProfilePopover = $ionicPopover.fromTemplateUrl('templates/forms/editProfileForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.editProfilePopover = popover;
    });

    $scope.showEditProfilePopover = function() {
        $scope.editProfilePopover.show();
    }

    $scope.changePasswordPopover = $ionicPopover.fromTemplateUrl('templates/forms/changePasswordForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.changePasswordPopover = popover;
    });

    $scope.showChangePasswordPopover = function() {
        $scope.changePasswordPopover.show();
    }

    $scope.changePassword = function() {
        $scope.changePasswordPopover.hide();
        $ionicLoading.show();
        var sendData = {
            'id': $scope.profile.id,
            'user': $scope.user
        };
        user.changePassword(sendData)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $localstorage.setObject('profile', $scope.profile);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: data.message
                    });
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.changePasswordPopover.hide();
            });
    }

    $scope.submit = function() {
        $scope.editProfilePopover.hide();
        $ionicLoading.show();
        var sendData = {
            'profile': $scope.profile
        };
        user.editProfile(sendData)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $localstorage.setObject('profile', $scope.profile);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success',
                        template: data.message
                    });
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function(err) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
                $scope.editProfilePopover.hide();
            });
    }

    // Set Ink
    ionic.material.ink.displayEffect();
})

.controller('FeedbackCtrl', function($scope, user, $ionicLoading, $ionicPopup, $localstorage) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.feedback = {};
    $scope.profile = $localstorage.getObject('profile');

    $scope.submit = function() {
        var dummy = {
            'id': $scope.profile.id,
            'feedback': $scope.feedback.feedback
        };
        var confirm = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Are you sure you want to submit'
        }).then(function(res) {
            if (res) {
                $ionicLoading.show();
                user.sendFeedback(dummy)
                    .success(function(data) {
                        console.log(data);
                        if (data.status == 1) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Success',
                                template: data.message
                            });
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Error',
                                template: data.message
                            });
                        }
                    }).error(function() {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error',
                            template: 'Connection Error'
                        });
                    }).then(function() {
                        $ionicLoading.hide();
                    })
            }
        })
    }
    ionic.material.ink.displayEffect();

})

.controller('InmateCtrl', function($scope, admin, $ionicLoading, $ionicPopup, $localstorage, $ionicPopover) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);
    $scope.profile = $localstorage.getObject('profile');
    $scope.inmateList = {};
    $scope.searchText = "";
    $scope.edit = {};
    $scope.edit.toAddOrNot = true;

    var dummy = {
        'id': $scope.profile.id,
    };
    $ionicLoading.show();
    $scope.inmateDetails = function() {
        admin.inmateDetails(dummy)
            .success(function(data) {
                console.log(data);
                if (data.status == 1) {
                    $scope.inmateList = data.message;
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: data.message
                    });
                }
            }).error(function() {
                var alertPopup = $ionicPopup.alert({
                    title: 'Error',
                    template: 'Connection Error'
                });
            }).then(function() {
                $ionicLoading.hide();
            });
    }
    $scope.inmateDetails();


    $scope.inmateCostPopover = $ionicPopover.fromTemplateUrl('templates/forms/inmateEditCostForm.html', {
        scope: $scope
    }).then(function(popover) {
        $scope.inmateCostPopover = popover;
    });

    $scope.showinmateCostPopover = function(person) {
        // $scope.edit.amount = parseInt(person.amount);
        $scope.edit.amount = 0;
        $scope.edit.bill = person.bill;
        $scope.edit.id = person.id;
        $scope.edit.toAddOrNot = true;
        $scope.inmateCostPopover.show();
    }

    $scope.editCost = function() {
        console.log($scope.editamount);
        var confirm = $ionicPopup.confirm({
            title: 'Confirm',
            template: 'Are you sure you want to submit'
        }).then(function(res) {
            if (res) {
                $scope.inmateCostPopover.hide();
                $ionicLoading.show();
                var dummy = {
                    'id': $scope.profile.id,
                    'amount': $scope.edit.amount,
                    'bill': $scope.edit.bill
                }
                console.log(dummy);
                var option = 0;
                if (!$scope.edit.toAddOrNot)
                    option = 1;
                console.log(option);
                admin.inmateEditCost(dummy, $scope.edit.id, option)
                    .success(function(data) {
                        console.log(data);
                        if (data.status == 1) {
                            $scope.inmateDetails();
                        } else {
                            var alert = $ionicPopup.alert({
                                title: 'Error',
                                template: data.message
                            });
                        }
                    }).error(function(err) {
                        $ionicLoading.hide();
                        var alert = $ionicPopup.alert({
                            title: 'Error',
                            template: 'Connection Error'
                        });
                    }).then(function() {
                        $ionicLoading.hide();
                        $scope.inmateCostPopover.hide();
                    });
            }
        });
    }


    ionic.material.ink.displayEffect();
});
