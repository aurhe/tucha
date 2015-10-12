'use strict';

angular.module('tucha')
    .directive('tuchaDate', function ($timeout) {
        return {
            templateUrl: 'views/directives/tuchaDate.html',
            restrict: 'E',
            scope: {
                model: '=',
                editable: '=',
                label: '@',
                name: '@'
            },
            link: function postLink(scope, element) {//, attrs) {
                scope.open = function () {
                    $timeout(function () {
                        element.find('input')[0].focus();
                    });
                };
            }
        };
    });
