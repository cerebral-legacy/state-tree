var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to splice an array'] = function (test) {
  var lib = Lib({
    foo: ['foo', 'bar', 'zeta']
  });
  lib.splice('foo', 1, 1);
  test.deepEqual(lib.get(), {foo: ['foo', 'zeta']});
  test.done();
};

exports['should be able to splice an array and add extra values'] = function (test) {
  var lib = Lib({
    foo: ['foo', 'bar', 'zeta']
  });
  lib.splice('foo', 1, 1, 'mip');
  test.deepEqual(lib.get(), {foo: ['foo', 'mip', 'zeta']});
  test.done();
};

exports['should be able to splice and clear references'] = function (test) {
  var obj = { foo : 'bar' };
  var lib = Lib({
    foo: ['foo', obj, 'bar']
  });
  lib.splice('foo', 1, 1, 'mip');
  test.deepEqual(lib.get(), {foo: ['foo', 'mip', 'bar']});
  test.ok(!obj['.referencePaths']);
  test.done();
};

exports['should be able to splice, clear references and add references'] = function (test) {
  var obj = { foo : 'bar' };
  var obj2 = { foo: 'bar' };
  var lib = Lib({
    foo: ['foo', obj, 'bar']
  });
  lib.splice('foo', 1, 1, obj2);
  test.deepEqual(lib.get(), {foo: ['foo', {foo: 'bar'}, 'bar']});
  test.ok(!obj['.referencePaths']);
  test.deepEqual(obj2['.referencePaths'], [['foo', [['foo', {foo: 'bar'}, 'bar'], {foo: 'bar'}]]]);
  test.done();
};

exports['should be able to splice, clear references and add more than initial length'] = function (test) {
  var obj = { foo : 'bar' };
  var lib = Lib({
    foo: ['foo', obj, 'bar']
  });
  lib.splice('foo', 1, 1, 'mip', 'mop', 'bop');
  test.deepEqual(lib.get(), {foo: ['foo', 'mip', 'mop', 'bop', 'bar']});
  test.deepEqual(lib.flushChanges(), {foo: {1: true}});
  test.done();
};
