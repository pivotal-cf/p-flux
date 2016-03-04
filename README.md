```
npm install p-flux --save
```

`p-flux` is a lightweight implementation of flux combined with the immutability helpers of [PUI Cursor](https://github.com/pivotal-cf/pui-cursor).
This provides an easy way to keep data in sync while also retaining the speed advantages of immutable data.

## API

### useStore

The version of flux implemented with `p-flux` fundamentally uses a `store`, `Actions` and a `Dispatcher`.

The `store` is all of the data in your application. It should be injected into your entry point using the `useStore` method:

```js
var React = require('react');
var useStore = require('p-flux').useStore;

class Application extends React.Component {
  static propTypes = {
    store: React.PropTypes.object.isRequired
  };

  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <OtherComponent {...this.props.store}/>
    );
  }
}

const ApplicationWithStore = useStore(Application, options = {});

module.exports = ApplicationWithStore;
```

The `options` to `useStore` are:

| option | default | description |
| --- | --- | --- |
| `store` | `{}` | An object containing the initial state of your store on page load. This will be injected into `this.props.store` |
| `dispatcherHandlers` | `[]` | An array of objects responsible for handling events from the dispatcher |
| `actions` | `[]` | An array of objects responsible for custom actions |
| `onDispatch` | none | A callback that will be called with the event on every dispatch (mostly for debugging) |

### Dispatcher

The dispatcher owns the store and is the only one who should be allowed to change it. The dispatcher has a `dispatch` method for firing events:

```
var Dispatcher = require('p-flux').Dispatcher
Dispatcher.dispatch({type: 'addName', data: 'Bob'});
```

The `dispatch` method should be called from Actions or dispatcherHandlers,
but **not directly from React Components**.

When `dispatch` is called with an event, the Dispatcher calls the `onDispatch`
callback with the event. The event is then delegated to the appropriate
`dispatchHandler` (which should be included as an option on `useStore`).

The Dispatcher has a `$store` key, which is an instance of
[PUI Cursor](https://github.com/pivotal-cf/pui-cursor).
An example dispatcherHandler might look like:

```js
var dispatcherHandlerExample = {
  addName({data}) {
    this.$store.refine('names').push(data);
  },

  resetNames() {
    this.$store.merge({names: []});
  }
}
```

In the above example, `addName` and `resetNames` are now handled dispatcher events.
To add more events, either add keys to `dispatcherHandlerExample` or create another dispatcherHandler
and include it in the `dispatcherHandlers` option to `useStore`.

Look at the [PUI Cursor](https://github.com/pivotal-cf/pui-cursor) repo
for more information on the PUI Cursor API.


### Actions

`Actions` are globally available functions that present the only interface React components should use to update data.
React components should use `Actions` to create `Dispatcher` events; they should never call the dispatcher directly.

Actions specify user intention without necessarily knowing the implementation.
A typical action will take a small amount of data, massage it, and then dispatch an appropriate event.

**Actions should be completely atomic, having only have one responsibility**.

An example component using an Action is below:

```js
var Actions = require('p-flux').Actions;
var React = require('react')

class MyComponent extends React.Component {
  static propTypes = {
    persons: React.PropsTypes.array.isRequired
  };

  addAlice() {
    Actions.addPerson('Alice'); // default action
  }

  addLoudAlice() {
    Actions.addLoudPerson('Alice') // custom action
  }

  render() {
    return (
        <div>
          {this.props.persons.slice(-1)[0]}
          <button onClick={this.addAlice}>Click Me to Add Alice</button>
          <button onClick={this.addLoudAlice}>Click Me to Add Alice in all caps</button>
        </div>
    );
  }
}
```

A common use case for actions is to pass data to the dispatcher with no need for massaging.
To reduce boilerplate, `p-flux` automatically adds an action for each dispatcher event that is handled.
This means that in the example above, the `addPerson` action is automatically
created for you.
`Actions.addPerson('Alice')` is an example of using a default action and is
equivalent to `Dispatcher.dispatch({type: 'addPerson', data: 'Alice'})`.

If you would like to have more semantic actions than the default dispatcher actions,
provide custom actions.

Note that a custom action with the same name as a default action will replace the default action.
The `addLoudPerson` action used above is an example.

Example custom actions with `addLoudPerson` are below:

```js
var Dispatcher = require('p-flux').Dispatcher;

var customPersonActions = {
  addLoudPerson(person) {
    Dispatcher.dispatch({type: 'addPerson', data: person.toUpperCase()});
  }
}
```
## Recommended Practices

See [React Starter](https://github.com/pivotal-cf/react-starter) for a basic use case of p-flux.

### Composite Events

Generally, actions should only be responsible for one dispatcher event.
This ensures that all events go through
the `onDispatch` callback. This makes debugging much easier, especially for finding race conditions.
However, it is common to want an action to trigger multiple events. To do this, we recommend
dispatching events from dispatcherHandlers.

In the following example, a composite event fetches a list of users and then adds that list
to the store:

```js
var usersDispatcherHandler = {
  fetchUsers({data}) {
    $.ajax({data.url}).then(function(users){
      Dispatcher.dispatch({type: 'setUsers', data: users});
    });
  },

  setUsers({data}) {
    this.$store.merge({users: data});
  }
}
```

Note that the `fetchUsers` event calls `Dispatcher.dispatch` directly to fire the `setUsers` event.

### The Store

`useStore` injects a `store` prop into the entry point of your application.
Note that `store` is just a JavaScript object and is not strictly immutable.
While it is possible, **do not update the store manually**. Doing this will cause data to be out of sync.

Always use the `$store` variable and the [PUI Cursor](https://github.com/pivotal-cf/pui-cursor)
API to update the data.

### Data Outside the Store

**Do not store any data you want to share between components on state.**
This can cause data synchronization issues.

Using state should be rare. We recommend that you only use state for truly private data in a component.
Examples are booleans for whether a dropdown is open or a checkbox is checked,
although sometimes even these values are not private.
