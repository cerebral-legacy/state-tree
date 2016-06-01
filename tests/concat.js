var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to concat array'] = function (test) {
  var lib = Lib({
    foo: ['foo', 'bar']
  });
  lib.concat('foo', 'hepp');
  test.deepEqual(lib.get(), {foo: ['foo', 'bar', 'hepp']});
  test.done();
};


exports['should be able to add references and not remove existing'] = function (test) {
  var objA = {fooA: 'bar'};
  var objB = {fooB: 'bar'};
  var lib = Lib({
    foo: [objA]
  });
  lib.concat('foo', objB);
  test.ok(objA['.referencePaths']);
  test.ok(objB['.referencePaths']);
  test.done();
};

exports['should show what changed'] = function (test) {
  var lib = Lib({
    foo: ['foo']
  });
  lib.concat('foo', 'bar');
  test.deepEqual(lib.flushChanges(), { foo: true });
  test.done();
};
