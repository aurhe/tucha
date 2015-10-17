'use strict';

angular.module('tucha')
    .controller('LoginCtrl', function ($scope, $rootScope) {
        $rootScope.login = true;
        $scope.$on('$destroy', function () {
            $rootScope.login = false;
        });
    });
