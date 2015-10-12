'use strict';

describe('Directive: tuchaBoolean', function () {

  // load the directive's module
  beforeEach(module('tucha'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<tucha-boolean></tucha-boolean>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the tuchaBoolean directive');
  }));
});
