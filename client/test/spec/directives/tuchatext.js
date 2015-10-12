'use strict';

describe('Directive: tuchaText', function () {

    // load the directive's module
    beforeEach(module('tucha'));

    var element,
        scope;

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    it('should make hidden element visible', inject(function ($compile) {
        element = angular.element('<tucha-text></tucha-text>');
        element = $compile(element)(scope);
        expect(element.text()).toBe('this is the tuchaText directive');
    }));
});
