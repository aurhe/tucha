'use strict';

angular.module('tucha')
    .controller('GridCtrl', function ($scope, $location, $http, $timeout, states, columns) {
        var stateName = $location.path().split('/')[1];

        for (var i = 0; i < states.length; i++) {
            if (states[i].name === stateName) {
                $scope.state = states[i];
                states[i].active = true;
                $scope.title = states[i].title;
            } else {
                states[i].active = false;
            }
        }

        $http.get('/r/' + stateName).then(function (data) {
            //$scope.data = data.data;
            var columnDefs = [];

            if (stateName === 'animal') {
                columnDefs.push({
                    field: 'id',
                    name: '',
                    width: 50,
                    cellTemplate: '<img width="50" src="r/animal/{{row.entity.id}}/photo_wh50"/>'
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
                        $location.path('/' + stateName + '/' + row.entity.id);
                    }
                }
            };

        });

        $scope.add = function () {
            $location.path('/' + stateName + "/new");
        };
    });
