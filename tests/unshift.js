var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to unshift new values'] = function (test) {
  var lib = Lib({
    foo: ['foo']
  });
  lib.unshift('foo', 'bar2');
  test.deepEqual(lib.get(), {foo: ['bar2', 'foo']});
  test.done();
};

exports['should be able to unshift new values with reference defined'] = function (test) {
  var lib = Lib({
    foo: ['foo']
  });
  var item = {foo: 'bar'};
  lib.unshift('foo', item);
  test.deepEqual(lib.get('foo.0')['.referencePaths'], [['foo', [[item, 'foo'], item]]]);
  test.done();
};

exports['should show change to array when unshifted into'] = function (test) {
  var lib = Lib({
    foo: ['foo']
  });
  lib.unshift('foo', {});
  test.deepEqual(lib.flushChanges(), { foo: { 0: true }});
  test.done();
};
