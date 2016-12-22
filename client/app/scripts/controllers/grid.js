'use strict';

angular.module('tucha')
    .controller('GridCtrl', function ($rootScope, $scope, $location, $http, $timeout, states, columns) {
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
                    cellTemplate: '<div class="grid-image-cell"><img width="50" src="r/animal/{{row.entity.id}}/photo_wh50"/></div>'
                });
            } else if (stateName === 'associate') {
                $scope.feesDueList = [];
                $scope.currentYear = new Date().getFullYear();

                for (var i = 0; i < data.data.length; i++) {
                    if (!data.data[i].last_paid_fee || data.data[i].last_paid_fee < $scope.currentYear) {
                        $scope.feesDueList.push(data.data[i]);
                    }
                }
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
                rowHeight: 50,
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                },
                appScopeProvider: {
                    rowClick: function (row) {

                        if (stateName === 'animal') {
                            // generate current sort ids for the next and previous button to work
                            $rootScope.animalsSequence = [];

                            var rows = $scope.gridApi.core.getVisibleRows();

                            for (var i = 0; i < rows.length; i++) {
                                $rootScope.animalsSequence.push(rows[i].entity.id);
                            }
                        } else if (stateName === 'volunteer' || stateName === 'associate') {
                            // theese 2 sections are only shortcuts to persons with different filtered lists
                            stateName = 'person';
                        }

                        $location.path('/' + stateName + '/' + row.entity.id);
                    }
                }
            };

        });

        $scope.add = function () {
            $location.path('/' + stateName + "/new");
        };
    });
