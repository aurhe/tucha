'use strict';

angular
    .module('tucha', [
        'ngRoute',
        'ngTouch',
        'datePicker',
        'ui.grid'
    ])
    .config(function ($httpProvider, $routeProvider, states) {
        $httpProvider.defaults.withCredentials = true;

        $httpProvider.interceptors.push(function ($q, $location) {
            return {
                response: function (response) {
                    return response;
                }, responseError: function (response) {
                    if (response.status === 401) {
                        $location.url('/login');
                    }
                    return $q.reject(response);
                }
            };
        });

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
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl'
            })
            .when('/changePassword', {
                templateUrl: 'views/changePassword.html',
                controller: 'ChangePasswordCtrl'
            })
            .otherwise({
                redirectTo: '/animal'
            });
    })
    .run(function ($rootScope, states) {
        $rootScope.states = states;
    });
