'use strict';

describe('Filter: tuchaAge', function () {

  // load the filter's module
  beforeEach(module('tucha'));

  // initialize a new instance of the filter before each test
  var tuchaAge;
  beforeEach(inject(function ($filter) {
    tuchaAge = $filter('tuchaAge');
  }));

  it('should return the input prefixed with "tuchaAge filter:"', function () {
    var text = 'angularjs';
    expect(tuchaAge(text)).toBe('tuchaAge filter: ' + text);
  });

});
