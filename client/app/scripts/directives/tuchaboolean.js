'use strict';

angular.module('tucha')
    .directive('tuchaBoolean', function () {
        return {
            templateUrl: 'views/directives/tuchaBoolean.html',
            restrict: 'E',
            scope: {
                model: '=',
                editable: '=',
                label: '@',
                name: '@',
                yesLabel: '@?',
                noLabel: '@?'
            },
            link: function postLink(scope) {//, element, attrs) {
                scope.yesLabel = scope.yesLabel || 'Sim';
                scope.noLabel = scope.noLabel || 'Não';
            }
        };
    });
