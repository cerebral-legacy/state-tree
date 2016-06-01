var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to import data'] = function (test) {
  var lib = Lib({
    foo: 'foo'
  });
  lib.import({bar: 'wuut'});
  test.deepEqual(lib.get(), {foo: 'foo', bar: 'wuut'});
  test.done();
};

exports['should clear out and reset references'] = function (test) {
  var objA = {foo: 'bar'};
  var objB = {foo: 'bar'};
  var lib = Lib({
    foo: objA
  });
  lib.import({foo: { foo: 'mip' }, bar: objB, bop: objB});
  test.deepEqual(lib.get(), { foo: { foo: 'mip'}, bar: { foo: 'bar' }, bop: { foo: 'bar' }});
  test.ok(!objA['.referencePaths']);
  test.deepEqual(objB['.referencePaths'], [['bar'], ['bop']]);
  test.done();
};
