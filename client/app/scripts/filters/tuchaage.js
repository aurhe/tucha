'use strict';

angular.module('tucha')
    .filter('tuchaAge', function () {
        return function (input) {
            if (input && input !== '0000-00-00') {
                return new Date(new Date() - new Date(input)).getUTCFullYear() - 1970;
            } else {
                return '';
            }
        };
    });
