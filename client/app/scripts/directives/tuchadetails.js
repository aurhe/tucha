'use strict';

angular.module('tucha')
    .directive('tuchaDetails', function () {
        return {
            templateUrl: 'views/directives/tuchaDetails.html',
            restrict: 'E',
            scope: {
                model: '=',
                editable: '=',
                label: '@',
                name: '@'
            },
            link: function postLink() {//scope, element, attrs) {

            }
        };
    });
