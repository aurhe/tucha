'use strict';

describe('Filter: tuchaBoolean', function () {

  // load the filter's module
  beforeEach(module('tucha'));

  // initialize a new instance of the filter before each test
  var tuchaBoolean;
  beforeEach(inject(function ($filter) {
    tuchaBoolean = $filter('tuchaBoolean');
  }));

  it('should return the input prefixed with "tuchaBoolean filter:"', function () {
    var text = 'angularjs';
    expect(tuchaBoolean(text)).toBe('tuchaBoolean filter: ' + text);
  });

});
