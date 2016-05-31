var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should allow registering and running computed'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });

  var computed = lib.computed({
    foo: 'foo'
  }, function (state) {
    return state.foo;
  });

  test.equals(computed.get(), 'bar');
  test.done();
};

exports['should memoize result'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });

  var computed = lib.computed({
    foo: 'foo'
  }, function (state) {
    return state.foo;
  });

  test.ok(computed.hasChanged());
  test.equals(computed.get(), 'bar');
  test.ok(!computed.hasChanged({}));
  lib.set('foo', 'bar2');
  var changes = lib.flushChanges();
  test.ok(computed.hasChanged(changes));
  test.equals(computed.get(), 'bar2');
  test.done();
};

exports['should allow dynamic computed'] = function (test) {
  var lib = Lib({
    foo: 'bar',
    bar: 'foo'
  });

  var computedFactory = function (prop) {
    return lib.computed({
      foo: prop
    }, function (state) {
      return state.foo;
    });
  };
  var computedA = computedFactory('foo');
  test.equals(computedA.get(), 'bar');
  var computedB = computedFactory('bar');
  test.equals(computedB.get(), 'foo');
  test.done();
};
