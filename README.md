# state-tree
A state tree that handles reference updates and lets you flush a description of changes

### Why?
There are different ways of handling state. You have libraries like [Baobab](https://github.com/Yomguithereal/baobab) and [Mobx](https://github.com/mobxjs/mobx). They are part of the same domain, but they handle state changes very differently. From experience this is what I want:

- **One state tree**. It just keeps a much clearer mental image and I never get into circular dependencies with my state models. It is also easier to hydrate and rehydrate the state of my app
- **Fast updates**. Immutability has benefits like being able to replay state changes, undo/redo very easily and no unwanted mutations in other parts of your code. The problem though is that immutability is slow on instantiating large datasets
- **Referencing**. Immutability breaks referencing. Meaning that if one object references an other object and that object changes, the other object is not updated. This is a good thing from one perspective, but when it comes to handling relational data it is problematic. You have to create normalizing abstractions which can be hard to reason about
- **Where did it change?**. When we have referencing it is not enough just to be able to update the objects across each other, we also have to know that if object A changed and object B references it, object B also has a change. This can be done with observables/observers in Mobx, but Mobx is not built for single state trees

So here we are. I want a single state tree that has controlled mutations, allowing referencing and emits what changed along with any deps. **This is rather low level code that would require abstractions for a good API, but it is a start :-)**

### API

#### Instantiate
```js
import StateTree from 'state-tree';
const tree = StateTree({
  foo: 'bar'
});
```

#### Get state
```js
import StateTree from 'state-tree';
const tree = StateTree({
  foo: {
    bar: 'value'
  }
});

tree.get('foo.bar'); // "value"
```

#### Change state
```js
import StateTree from 'state-tree';
const tree = StateTree({
  foo: 'bar',
  list: []
});

tree.set('foo', 'bar2');
tree.unset('foo');
tree.push('list', 'something');
tree.pop('list');
tree.shift('list');
tree.unshift('list', 'someValue');
tree.splice('list', 0, 1, 'newValue');
```

#### Flushing changes
```js
import StateTree from 'state-tree';
const tree = StateTree({
  foo: 'bar',
  list: [{
    foo: 'bar'
  }]
});

tree.set('foo', 'bar2');
tree.flushChanges(); // { foo: true }
tree.set('list.0.foo', 'bar2');
tree.flushChanges(); // { list: { 0: { foo: true } } }
```

With the flushed changes you decide when it is time to update the interface. You can use this flushed change tree with abstractions in your UI. An example could be:

- Subscribe to flushes on the tree in a component wrapper
- Component wrapper are registered to specific paths, like `{ someList: 'foo.bar.list' }`
- You can now:

```js
tree.subscribe(function (changes) {
  var hasUpdate = listPath.reduce(function (changes, key) {
    return changes && changes[key];
  }, changes); // undefined
  if (hasUpdate) {
    component.forceUpdate();
  }
})
```

In this case, if we updated "foo" and the UI registers to "list" it would not update. This logic is instead of having a register of observables. This also make sure that when you for example register to "list" and a change happens on `{ list: { 0: true } }` the component will still update, which it should.

### Referencing
So with this lib you can have a list of users and just add them to the posts.

```js
import StateTree from 'state-tree';
const userA = {
  name: 'john'
};
const tree = StateTree({
  users: [userA],
  posts: [{
    title: 'Some post',
    user: userA
  }]
});

tree.set('users.0.name', 'woop');
tree.flushChanges(); // { users: { 0: true }, posts: { 0: { user: true } } }
```
