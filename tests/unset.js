var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to unset values'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });
  lib.unset('foo');
  test.deepEqual(lib.get(), {});
  test.done();
};

exports['should be able to unset values and remove any references'] = function (test) {
  var obj = {foo: 'bar'};
  var lib = Lib({
    foo: obj,
    bar: obj
  });
  lib.unset('foo');
  test.deepEqual(obj['.referencePaths'], [['bar']]);
  test.done();
};

exports['should show what changed'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });
  lib.unset('foo');
  test.deepEqual(lib.flushChanges(), { foo: true });
  test.done();
};
