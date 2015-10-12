'use strict';

angular.module('tucha')
    .controller('DetailsCtrl', function ($scope, $location, $routeParams, $http, $timeout, states) {
        var previousDetails;
        var state = $location.path().split('/')[1];

        for (var i = 0; i < states.length; i++) {
            if (states[i].name === state) {
                states[i].active = true;
                $scope.title = states[i].title;
            } else {
                states[i].active = false;
            }
        }

        $scope.currentTime = Date.now();
        $scope.template = 'views/content/' + state + 'Details.html';
        $scope.entityId = $routeParams.id;

        if ($scope.entityId === 'new') {
            $scope.editable = true;
            $scope.details = {};

            if (state === 'animal') {
                $scope.details.states = [];
            }
        } else {
            $scope.editable = false;
            $http.get('/r' + $location.path()).then(function (data) {
                $scope.details = data.data;
                if (state === 'animal') {
                    $scope.details.states = [];
                    $http.get('/r/animal/' + $scope.entityId + '/states').then(function (data) {
                        $scope.details.states = data.data;
                    });
                }
            });
        }

        if (state === 'animal') {
            $scope.addState = function () {
                $scope.details.states.push({position: $scope.details.states.length, date: new Date(), details: ''});
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

                $http.post('/r/' + state + '/' + (id) + '/picture', fd, {
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
            $http.post('/r' + $location.path(), $scope.details).then(function (result) {
                if (state === 'animal' && $scope.entityId === 'new') {
                    var files = angular.element('input[type=file]')[0].files;

                    if (files.length) {
                        $scope.submitPicture(files, result.data, function () {
                            $location.path('/' + state + '/' + result.data);
                        });
                    } else {
                        $location.path('/' + state + '/' + result.data);
                    }
                } else {
                    if ($scope.entityId === 'new') {
                        $location.path('/' + state + '/' + result.data);
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
            $http.delete('/r/animal/' + $scope.entityId).then(function () {
                $location.path('/' + state);
            });
        };
    });
