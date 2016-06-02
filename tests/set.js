var Lib = require('../');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to set new values'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });
  test.deepEqual(lib.get(), {foo: 'bar'});
  lib.set('foo', 'bar2');
  test.deepEqual(lib.get(), {foo: 'bar2'});
  test.done();
};

exports['should show change on path set'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });
  lib.set('foo', 'bar2');
  test.deepEqual(lib.flushChanges(), { foo: true });
  test.done();
};

exports['should show change on nested set'] = function (test) {
  var lib = Lib({
    foo: {
      bar: 'foo'
    }
  });
  lib.set('foo.bar', 'foo2');
  test.deepEqual(lib.flushChanges(), { foo: { bar: true } });
  test.done();
};

exports['should show change on referenced set'] = function (test) {
  var obj = { foo: 'bar' };
  var lib = Lib({
    foo: obj,
    bar: obj
  });
  lib.set('foo.foo', 'foo2');
  test.deepEqual(lib.flushChanges(), { foo: { foo: true }, bar: { foo: true } });
  test.done();
};

exports['should show change on nested array set'] = function (test) {
  var obj = { foo: 'bar' };
  var lib = Lib({
    foo: obj,
    bar: [{}, obj]
  });
  lib.set('bar.1.foo', 'foo2');
  test.deepEqual(lib.flushChanges(), { foo: { foo: true }, bar: { 1: { foo: true } } });
  test.done();
};

exports['should be able to set paths that does not exist'] = function (test) {
  var lib = Lib({});
  lib.set('foo.bar.test', 'bar2');
  test.deepEqual(lib.get(), {foo: { bar: { test: 'bar2' } } });
  test.deepEqual(lib.get('foo')['.referencePaths'], [['foo']]);
  test.deepEqual(lib.get('foo.bar')['.referencePaths'], [['foo', 'bar']]);
  test.done();
};
