'use strict';

angular.module('tucha')
    .controller('GridCtrl', function ($scope, $location, $http, $timeout, states, columns) {
        var state = $location.path().split('/')[1];

        for (var i = 0; i < states.length; i++) {
            if (states[i].name === state) {
                states[i].active = true;
                $scope.title = states[i].title;
            } else {
                states[i].active = false;
            }
        }

        $http.get('/r/' + state).then(function (data) {
            //$scope.data = data.data;
            var columnDefs = [];

            if (state === 'animal') {
                columnDefs.push({
                    field: 'id',
                    name: '',
                    width: 30,
                    cellTemplate: '<img width=30 src="r/animal/{{row.entity.id}}/thumbnail"/>'
                });
            }

            for (var key in data.data[0]) {
                columnDefs.push(columns[key]);
            }

            $scope.gridOptions = {
                data: data.data,
                columnDefs: columnDefs,
                minRowsToShow: data.data.length + 0.1,
                enableHorizontalScrollbar: 0,
                enableVerticalScrollbar: 0,
                enableGridMenu: true,
                rowTemplate: 'views/directives/rowTemplate.html',
                appScopeProvider: {
                    rowClick: function (row) {
                        $location.path('/' + state + '/' + row.entity.id);
                    }
                }
            };

        });

        $scope.add = function () {
            $location.path('/' + state + "/new");
        };
    });
