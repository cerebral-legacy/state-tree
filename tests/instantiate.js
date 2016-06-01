var Lib = require('../');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should instantiate state with referencePaths'] = function (test) {
  var lib = Lib({
    foo: 'bar'
  });
  test.deepEqual(lib.get(), {foo: 'bar'});
  test.ok('.referencePaths' in lib.get());
  test.deepEqual(lib.get()['.referencePaths'], [[]]);
  test.done();
};

exports['should create reference paths for nested arrays and objects'] = function (test) {
  var item = {foo: 'bar'};
  var lib = Lib({
    foo: {
      bar: {}
    },
    bar: [item]
  });
  test.deepEqual(lib.get(), {foo: { bar: {} }, bar: [{foo: 'bar'}]});
  test.ok('.referencePaths' in lib.get('foo'));
  test.deepEqual(lib.get('foo')['.referencePaths'], [['foo']]);
  test.deepEqual(lib.get('foo.bar')['.referencePaths'], [['foo', 'bar']]);
  test.deepEqual(lib.get('bar')['.referencePaths'], [['bar']]);
  test.deepEqual(lib.get('bar.0')['.referencePaths'], [['bar', [[item], item]]]);
  test.done();
};

exports['should create reference when object or array is reused'] = function (test) {
  var obj = {};
  var array = [];
  var lib = Lib({
    foo: obj,
    bar: array,
    foo2: obj,
    bar2: array
  });
  test.deepEqual(lib.get('foo')['.referencePaths'], [['foo'], ['foo2']]);
  test.deepEqual(lib.get('bar')['.referencePaths'], [['bar'], ['bar2']]);
  test.equal(lib.get('foo'), lib.get('foo2'));
  test.equal(lib.get('bar'), lib.get('bar2'));
  test.done();
};

exports['should create reference correctly from within an array'] = function (test) {
  var obj = {foo: 'bar'};
  var lib = Lib({
    list: [{
      user: obj
    }]
  });
  test.deepEqual(lib.get('list.0.user')['.referencePaths'], [['list', [[{user: obj}], {user: obj}], 'user']]);
  test.done();
};

exports['should be able to get undefined from paths that are not in tree'] = function (test) {
  var lib = Lib({});
  test.equals(lib.get('some.path'), undefined);
  test.done();
};
