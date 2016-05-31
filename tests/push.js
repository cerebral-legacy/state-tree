var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to push new values'] = function (test) {
  var lib = Lib({
    foo: []
  });
  lib.push('foo', 'bar2');
  test.deepEqual(lib.get(), {foo: ['bar2']});
  test.done();
};

exports['should be able to push new values with reference defined'] = function (test) {
  var lib = Lib({
    foo: []
  });
  var item = {foo: 'bar'};
  lib.push('foo', item);
  test.deepEqual(lib.get('foo.0')['.referencePaths'], [['foo', [[item], item]]]);
  test.done();
};

exports['should show change to array when pushed into'] = function (test) {
  var lib = Lib({
    foo: []
  });
  lib.push('foo', {});
  test.deepEqual(lib.flushChanges(), { foo: { 0: true }});
  test.done();
};

exports['should change reference even if changed position in array'] = function (test) {
  var item = {foo: 'bar'};
  var lib = Lib({
    foo: [item],
    bar: item
  });
  lib.unshift('foo', {});
  lib.flushChanges();
  lib.set('bar.foo', 'bar2');
  test.deepEqual(lib.flushChanges(), { foo: { 1: {foo: true} }, bar: {foo: true}});
  test.done();
};
