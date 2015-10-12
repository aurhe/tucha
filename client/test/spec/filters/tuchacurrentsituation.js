'use strict';

describe('Filter: tuchaCurrentSituation', function () {

  // load the filter's module
  beforeEach(module('tucha'));

  // initialize a new instance of the filter before each test
  var tuchaCurrentSituation;
  beforeEach(inject(function ($filter) {
    tuchaCurrentSituation = $filter('tuchaCurrentSituation');
  }));

  it('should return the input prefixed with "tuchaCurrentSituation filter:"', function () {
    var text = 'angularjs';
    expect(tuchaCurrentSituation(text)).toBe('tuchaCurrentSituation filter: ' + text);
  });

});
