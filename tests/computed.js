var Lib = require('../');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should allow registering and running computed'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });

  var computed = Lib.computed({
    foo: 'foo'
  }, function (state) {
    return state.foo;
  });

  test.equals(computed.get(lib.get()), 'bar');
  test.done();
};

exports['should memoize result'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });

  var computed = Lib.computed({
    foo: 'foo'
  }, function (state) {
    return state.foo;
  });

  test.ok(computed.hasChanged());
  test.equals(computed.get(lib.get()), 'bar');
  test.ok(!computed.hasChanged({}));
  lib.set('foo', 'bar2');
  var changes = lib.flushChanges();
  test.ok(computed.hasChanged(changes));
  test.equals(computed.get(lib.get()), 'bar2');
  test.done();
};

exports['should allow dynamic computed'] = function (test) {
  var lib = Lib({
    foo: 'bar',
    bar: 'foo'
  });

  var computedFactory = function (prop) {
    return Lib.computed({
      foo: prop
    }, function (state) {
      return state.foo;
    });
  };
  var computedA = computedFactory('foo');
  test.equals(computedA.get(lib.get()), 'bar');
  var computedB = computedFactory('bar');
  test.equals(computedB.get(lib.get()), 'foo');
  test.done();
};
