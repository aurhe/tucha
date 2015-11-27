'use strict';

angular.module('tucha-deck', [
    'ngTouch',
    'akoenig.deckgrid',
    'infinite-scroll',
    'ngDialog'
]);

angular.module('tucha-deck')
    .controller('DeckCtrl', function ($scope, $http, ngDialog) {

        $scope.click = function (animal) {
            ngDialog.open({
                template: 'views/deckCardPopup.html',
                controller: ['$scope', function ($scope) {
                    $http.get('/r/animal/' + animal.id).then(function (data) {
                        $scope.animal = data.data;

                        if ($scope.animal.date_of_birth !== null) {
                            $scope.animal.age = new Date(new Date() - new Date($scope.animal.date_of_birth)).getUTCFullYear() - 1970;
                        }
                    });
                }]
            });
        };

        $http.get('/r/adoptableAnimals').then(function (data) {
            var fullList = data.data;
            $scope.animals = fullList.slice(0, 10);

            $scope.loadMore = function () {
                $scope.animals = $scope.animals.concat(fullList.slice($scope.animals.length, $scope.animals.length + 10));
            };
        });
    });