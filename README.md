# state-tree (EXPERIMENTAL)
A state tree that handles reference updates and lets you flush a description of changes

### Why?
There are different ways of handling state. You have libraries like [Baobab](https://github.com/Yomguithereal/baobab) and [Mobx](https://github.com/mobxjs/mobx). They are part of the same domain, but they handle state changes very differently. From experience this is what I want:

- **One state tree**. It just keeps a much clearer mental image and I never get into circular dependencies with my state models. It is also easier to hydrate and dehydrate the state of my app

- **Control changes**. I want a simple way to control the changes made to the app. By using a `state.set('some.state', 'foo')` API instead of `some.state = 'foo'` this control becomes more intuitive as you have a specific API for making changes, rather than "changing stuff all over". It also makes it a lot easier to implement tracking of any changes

- **Fast updates**. Immutability has benefits like being able to replay state changes, undo/redo very easily and no unwanted mutations in other parts of your code. The problem though is that immutability is slow on instantiating large datasets

- **Referencing**. Immutability breaks referencing. Meaning that if one object references an other object and that object changes, the other object is not updated. This is a good thing from one perspective, but when it comes to handling relational data it is problematic. You have to create normalizing abstractions which can be hard to reason about

- **Where did it change?**. When we have referencing it is not enough to update objects across each other, we also have to know if a change to object A affects object B, object B also has a change. This is what Mobx does a really great job on, but it is not a single state tree

So here we are. I want a single state tree that has controlled mutations, allowing referencing and emits what changed along with any references. **This is rather low level code that would require abstractions for a good API, but it is a start :-)**

Translated into code:

```js
const tree = StateTree({
  title: 'Whatap!',
  contacts: contacts,
  posts: []
});

function addPost() {
  // We just add a new post and reference
  // a user from somewhere else in our state tree
  tree.push('posts', {
    title: 'Some post',
    user: tree.get('contacts.0')
  });
  tree.flushChanges(); // Components subscribes to these flushes
}

function changeName() {
  // We change the user in the contacts
  tree.set('contacts.0.name', 'Just a test');

  // The component subscribing to "posts" will still
  // be notified about an update because one of the posts
  // has this user referenced
  tree.flushChanges();
}
```

### Building a small app
*tree.js*
```js
import StateTree from 'state-tree';

export default StateTree({
  list: []
});
```

*addItem.js*
```js
import tree from './tree';
export default addItem(item) {
  tree.push('list', item);
}
```

*Items.js*
```js
import React from 'react';
import HOC from 'state-tree/react/HOC';
import addItem from './addItem';

function Items(props) {
  return (
    <div>
      <button onClick={() => addItem({foo: 'bar'})}>Add item</button>
      <ul>
        {props.list.map((item, index) => <li key={index}>{item.foo}</li>)}
      </ul>
    </div>
  );
}

export default HOC(Items, {
  list: 'list'
})
```

*main.js*
```js
import React, {render} from 'react';
import Container from 'state-tree/react/Container';
import tree from './tree';
import Items from './Items';

render((
  <Container tree={tree}>
    <Items />
  </Container>
), document.querySelector('#app'));
```

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

// You can also use arrays for the path
tree.set(['foo'], 'bar2');

tree.set('foo', 'bar2');
tree.merge('foo', {something: 'cool'});
tree.import({foo: 'bar', deeply: {nested: 'foo'}}); // Deep merging
tree.unset('foo');
tree.push('list', 'something');
tree.pop('list');
tree.shift('list');
tree.unshift('list', 'someValue');
tree.splice('list', 0, 1, 'newValue');
tree.concat('list', ['something']);
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

// It returns an object representing the changes
tree.flushChanges(); // { list: { 0: { foo: true } } }
```

With the flushed changes you decide when it is time to update the interface. You can use this flushed change tree with abstractions in your UI. An example could be:

- Subscribe to flushes on the tree in a component wrapper
- Component wrapper are registered to specific paths, like `{ someList: 'foo.bar.list' }`
- You can now:

```js
tree.subscribe(function (changes) {
  var hasUpdate = listPath.reduce(function (changes, key) {
    return changes ? changes[key] : false;
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

### Computed
You can also compute state.

```js
import StateTree from 'state-tree';
const tree = StateTree({
  foo: 'bar'
});

const myComputed = tree.computed({
  foo: 'foo' // The deps, just like a component
}, state => {
  return state.foo + '!!!';
});

myComputed.get(tree) // "bar!!!"
let changes = tree.flushChanges(); // {}
myComputed.hasChanged(changes); // false
tree.set('foo', 'bar2');
changes = tree.flushChanges(); // { foo: true }
myComputed.hasChanged(changes); // true
myComputed.get(tree) // "bar2!!!"
```
So, this seems like a lot of code to make computed work, but again, this is low level. Implemented in the HOC of React you can simply do this.

```js
import React from 'react';
import HOC from 'state-tree/react/HOC';
import {computed} from 'state-tree';
import addItem from './addItem';

const awesomeItems = computed({
  list: 'list' // Define its deps
}, state => {
  return state.list.filter(item => item.isAwesome);
});

function Items(props) {
  return (
    <div>
      <button onClick={() => addItem({foo: 'bar'})}>Add item</button>
      <ul>
        {props.list.map((item, index) => <li key={index}>{item.foo}</li>)}
      </ul>
    </div>
  );
}

export default HOC(Items, {
  list: awesomeItems
})
```

There is no magic going on here. The components will pass in the flushed "change tree" to whatever computed they have. This is what tells them to verify if an update is necessary, if not already ready to calculate a new value.
