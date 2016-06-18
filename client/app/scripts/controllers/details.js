'use strict';

angular.module('tucha')
    .controller('DetailsCtrl', function ($scope, $location, $routeParams, $http, $timeout, states) {
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
        $scope.submit = function () {
            $http.post('/r/' + stateName + '/' + $scope.entityId, $scope.details).then(function (result) {
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
