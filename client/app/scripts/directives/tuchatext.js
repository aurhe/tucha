'use strict';

angular.module('tucha')
    .directive('tuchaText', function () {
        return {
            templateUrl: 'views/directives/tuchaText.html',
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
