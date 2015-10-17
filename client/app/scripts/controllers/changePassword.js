'use strict';

angular.module('tucha')
    .controller('ChangePasswordCtrl', function ($scope, $http, $location) {
        $scope.submit = function () {
            if ($scope.password1 && $scope.password1.length && $scope.password1 === $scope.password2) {
                $http.post('/r/changePassword', {password: $scope.password1}).then(function () {
                    $location.path('/');
                });
            }
        };
    });
