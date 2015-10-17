'use strict';

angular.module('tucha')
    .directive('tuchaTypeahead', function ($http) {
        return {
            templateUrl: 'views/directives/tuchaTypeahead.html',
            restrict: 'E',
            scope: {
                model: '=',
                editable: '=',
                label: '@',
                name: '@',
                url: '@'
            },
            link: function postLink(scope) {//, element, attrs) {
                var items;

                scope.selected = {
                    text: ''
                };

                $http.get('/r/' + scope.url).then(function (result) {
                    items = result.data;

                    for (var i = 0; i < items.length; i++) {
                        if (items[i].id === scope.model[scope.name]) {
                            scope.selected.text = items[i].name;
                            break;
                        }
                    }
                });

                scope.showDropdown = false;

                scope.inputChanged = function () {
                    if (scope.selected.text.length && items.length) {
                        scope.items = items.filter(function (item) {
                            item.active = false;
                            return item.name && item.name.toLowerCase().indexOf(scope.selected.text.toLowerCase()) !== -1;
                        });
                        if (scope.items.length) {
                            scope.items[0].active = true;
                        }

                        scope.showDropdown = true;
                    } else {
                        scope.showDropdown = false;
                        scope.model[scope.name] = null;
                    }
                };

                scope.itemSelected = function (item) {
                    scope.showDropdown = false;
                    scope.selected.text = item.name;
                    scope.model[scope.name] = item.id;
                };

                scope.keydown = function (event) {
                    var i;
                    switch (event.keyCode) {
                        case 40:
                            for (i = 0; i < scope.items.length - 1; i++) {
                                if (scope.items[i].active) {
                                    scope.items[i].active = false;
                                    scope.items[i + 1].active = true;
                                    break;
                                }
                            }
                            break;
                        case 38:
                            for (i = 1; i < scope.items.length; i++) {
                                if (scope.items[i].active) {
                                    scope.items[i].active = false;
                                    scope.items[i - 1].active = true;
                                    break;
                                }
                            }
                            break;
                        case 13:
                            for (i = 0; i < scope.items.length; i++) {
                                if (scope.items[i].active) {
                                    scope.itemSelected(scope.items[i]);
                                    break;
                                }
                            }
                            break;
                    }
                };
            }
        };
    });
