'use strict';

angular
    .module('tucha', [
        'ngRoute',
        'ngTouch',
        'datePicker',
        'ui.grid'
    ])
    .config(function ($routeProvider, states) {

        for (var i = 0; i < states.length; i++) {
            $routeProvider
                .when('/' + states[i].name, {
                    templateUrl: 'views/grid.html',
                    controller: 'GridCtrl'
                })
                .when('/' + states[i].name + '/:id', {
                    templateUrl: 'views/details.html',
                    controller: 'DetailsCtrl'
                });
        }

        $routeProvider
            .otherwise({
                redirectTo: '/animal'
            });
    })
    .run(function ($rootScope, states) {
        $rootScope.states = states;
    });
