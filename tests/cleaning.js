var Lib = require('../');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2))
}

exports['should remove references completely when cleaned and no other reference'] = function (test) {
  var item = {foo: 'bar'};
  var lib = Lib({
    foo: item
  });
  test.deepEqual(lib.get('foo')['.referencePaths'], [['foo']]);
  lib.set('foo', 'bar');
  test.ok(!item['.referencePaths']);
  test.done();
};

exports['should remove references when cleaned'] = function (test) {
  var item = {foo: 'bar'};
  var lib = Lib({
    foo: item,
    foo2: item
  });
  test.deepEqual(lib.get('foo')['.referencePaths'], [['foo'], ['foo2']]);
  lib.set('foo', 'bar');
  test.deepEqual(item['.referencePaths'], [['foo2']]);
  test.done();
};

exports['should remove references when cleaned inside arrays'] = function (test) {
  var item = {foo: 'bar'};
  var lib = Lib({
    foo: item,
    foo2: [{
      user: item
    }]
  });
  test.deepEqual(lib.get('foo')['.referencePaths'], [['foo'], ['foo2', [[{user: item}], {user: item}], 'user']]);
  lib.shift('foo2');
  test.deepEqual(lib.get('foo')['.referencePaths'], [['foo']]);
  test.done();
};

exports['should remove references in complex structures'] = function (test) {
  var item = {foo: 'bar'};
  var lib = Lib({
    foo: item,
    foo2: [{
      comments: [{
        user: item
      }]
    }]
  });
  test.deepEqual(lib.get('foo')['.referencePaths'], [
    ['foo'],
    ['foo2', [[{comments: [{ user: item }]}], {comments: [{user: item}]}], 'comments', [[{user: item}], {user: item }], 'user'],
  ]);
  lib.shift('foo2');
  test.deepEqual(lib.get('foo')['.referencePaths'], [['foo']]);
  test.done();
};
