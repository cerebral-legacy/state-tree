var Lib = require('../src');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should be able to merge new values'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });
  lib.merge({
    foo: 'bar2'
  });
  test.deepEqual(lib.get(), {foo: 'bar2'});
  test.done();
};

exports['should be able to merge values with reference'] = function (test) {
  var obj = {foo: 'bar'};
  var lib = Lib({
    foo: 'bar'
  });
  lib.merge({
    foo: obj
  });
  test.deepEqual(obj['.referencePaths'], [['foo']]);
  test.done();
};

exports['should be able to merge values with reference in nested structure'] = function (test) {
  var obj = {foo: 'bar'};
  var lib = Lib({
    foo: {
      bar: null
    }
  });
  lib.merge('foo', {
    bar: obj
  });
  test.deepEqual(obj['.referencePaths'], [['foo', 'bar']]);
  test.done();
};

exports['should clear references when merging over values'] = function (test) {
  var obj = {foo: 'bar'};
  var lib = Lib({
    foo: {
      bar: obj
    }
  });
  lib.merge('foo', {
    bar: 'bar'
  });
  test.ok(!obj['.referencePaths']);
  test.done();
};
