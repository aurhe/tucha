'use strict';

angular.module('tucha')
    .filter('tuchaBoolean', function () {
        return function (input, attrs) {
            if (input === 1 || input === '1') {
                return attrs && attrs[0] || 'Sim';
            } else if (input === 0 || input === '0') {
                return attrs && attrs[1] || 'Não';
            } else {
                return '';
            }
        };
    });
