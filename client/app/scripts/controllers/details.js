'use strict';

angular.module('tucha')
    .controller('DetailsCtrl', function ($rootScope, $scope, $location, $routeParams, $http, $timeout, states) {
        var previousDetails;
        var stateName = $location.path().split('/')[1];

        for (var i = 0; i < states.length; i++) {
            if (states[i].name === stateName) {
                $scope.state = states[i];
                states[i].active = true;
                $scope.title = states[i].title;
            } else {
                states[i].active = false;
            }
        }

        $scope.currentTime = Date.now();
        $scope.template = 'views/content/' + stateName + 'Details.html';
        $scope.entityId = $routeParams.id;

        if ($scope.entityId === 'new') {
            $scope.editable = true;
            $scope.details = {};

            if (stateName === 'animal') {
                $scope.details.states = [];
            }
        } else {
            $scope.editable = false;
            $http.get('/r/' + stateName + '/' + $scope.entityId).then(function (data) {
                $scope.details = data.data;
                if (stateName === 'animal') {
                    $scope.details.states = [];
                    $http.get('/r/animal/' + $scope.entityId + '/states').then(function (data) {
                        $scope.details.states = data.data;
                    });
                }
            });
        }

        if (stateName === 'animal') {
            $scope.addState = function () {
                var position = 0;
                for (var i = 0; i < $scope.details.states.length; i++) {
                    if ($scope.details.states[i].position >= position) {
                        position = $scope.details.states[i].position + 1;
                    }
                }
                $scope.details.states.push({position: position, date: new Date(), details: ''});
            };
            $scope.deleteState = function (state) {
                for (var i = 0; i < $scope.details.states.length; i++) {
                    if ($scope.details.states[i].position === state.position) {
                        $scope.details.states[i].deleted = true;
                        break;
                    }
                }
            };

            $scope.openStateDatePicker = function ($index) {
                $timeout(function () {
                    angular.element.find('#state_' + $index)[0].focus();
                });
            };

            if($rootScope.animalsSequence === undefined) {
                // if no sequence was obtained from the grid, fetch the default from the server
                $http.get('/r/animal/sequence').then(function (data) {
                    $rootScope.animalsSequence = data.data;
                });
            }

            $scope.next = function () {
                var id = parseInt($scope.entityId, 10);
                for (var i = 0; i < $rootScope.animalsSequence.length; i++) {
                    if ($rootScope.animalsSequence[i] === id) {
                        $location.path('/animal/' + $rootScope.animalsSequence[i + 1]);
                        break;
                    }
                }
            };

            $scope.previous = function () {
                var id = parseInt($scope.entityId, 10);
                for (var i = 0; i < $rootScope.animalsSequence.length; i++) {
                    if ($rootScope.animalsSequence[i] === id) {
                        $location.path('/animal/' + $rootScope.animalsSequence[i - 1]);
                        break;
                    }
                }
            };
        }

        $scope.submitPicture = function (files, id, callback) {
            if (!id) {
                if ($scope.entityId === 'new') {
                    return;
                } else {
                    id = $scope.entityId;
                }
            }
            if (files.length) {
                var fd = new FormData();
                fd.append('file', files[0]);

                $http.post('/r/' + stateName + '/' + id + '/photo', fd, {
                    withCredentials: true,
                    headers: {'Content-Type': undefined},
                    transformRequest: angular.identity
                }).then(function () {
                    $scope.currentTime = Date.now(); // refresh picture
                    if (callback) {
                        callback();
                    }
                });
            }
        };
        $scope.edit = function () {
            previousDetails = angular.copy($scope.details);
            $scope.editable = true;
        };

        function toYMD(date) {
            if(date !== undefined && date !== null) {
                var month =  date.getMonth() + 1,
                    day = date.getDate();
                return date.getFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
            } else {
                return date;
            }
        }

        $scope.submit = function () {

            var details = angular.copy($scope.details);

            // remove time from dates before sending to the server
            details.date_of_birth = toYMD(details.date_of_birth);
            details.received_date = toYMD(details.received_date);
            details.death_date = toYMD(details.death_date);
            details.date = toYMD(details.date);
            details.returned_date = toYMD(details.returned_date);
            details.start_date = toYMD(details.start_date);
            details.end_date = toYMD(details.end_date);
            details.opening_date = toYMD(details.opening_date);
            details.expiration_date = toYMD(details.expiration_date);
            details.acquired_date = toYMD(details.acquired_date);
            details.sterilization_date = toYMD(details.sterilization_date);

            $http.post('/r/' + stateName + '/' + $scope.entityId, details).then(function (result) {
                if (stateName === 'animal' && $scope.entityId === 'new') {
                    var files = angular.element('input[type=file]')[0].files;

                    if (files.length) {
                        $scope.submitPicture(files, result.data, function () {
                            $location.path('/' + stateName + '/' + result.data);
                        });
                    } else {
                        $location.path('/' + stateName + '/' + result.data);
                    }
                } else {
                    if ($scope.entityId === 'new') {
                        $location.path('/' + stateName + '/' + result.data);
                    } else {
                        $scope.editable = false;
                    }
                }
            });
        };
        $scope.cancel = function () {
            $scope.details = previousDetails;
            $scope.editable = false;
        };
        $scope.delete = function () {
            $http.delete('/r/' + stateName + '/' + $scope.entityId).then(function () {
                $location.path('/' + stateName);
            });
        };
    });
