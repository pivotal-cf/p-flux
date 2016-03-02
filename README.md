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

The dispatcher owns the store and is the only one who should be allowed to change it. The dispatcher has a `dispatch` method for firing events

```
var Dispatcher = require('p-flux').Dispatcher
Dispatcher.dispatch({type: 'addName', data: 'Bob'});
```

The `dispatch` method is intended to be called from Actions or dispatcherHandlers, 
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

`Actions` are globally available functions that present the only interface React Components should use to update data.
React Components should use `Actions` to create `Dispatcher` events; they should never call the dispatcher directly.
Actions are generally a way of specifying user intention without necessarily knowing the implementation. 
A typical action will take a small amount of data, massage it, and then dispatch an appropriate event.
**Actions should only have one responsibility and be completely atomic**.

An example component using an Action is below:

```js
var Actions = require('p-flux').Actions;
var React = require('react')

class MyComponent extends React.Component {
  static propTypes = {
    names: React.PropsTypes.array.isRequired
  };
  
  addAlice() {
    Actions.addName('Alice'); // default action
  }
  
  addLoudAlice() {
    Actions.addLoudName('Alice') // custom action
  }

  render() {
    return (
        <div>
          {this.props.names.slice(-1)[0]}
          <button onClick={this.addAlice}>Click Me to Add Alice</button>
          <button onClick={this.addLoudAlice}>Click Me to Add Alice in all caps</button>
        </div>
    );
  }
}
```

A common use case for actions is to pass data to the dispatcher with no need for massaging. 
To reduce boilerplate, `p-flux` automatically adds an action for each dispatcher event that is handled. 
This means that in the example above, the `addName` action is automatically 
created for you. 
`Actions.addName('Alice')` is an example of using a default action and is 
equivalent to `Dispatcher.dispatch({type: 'addName', data: 'Alice'})`.

If you would like to have more semantic actions, than the dispatcher default actions,
you can provide custom actions. 
Note that a custom action with the same name as a default action will replace the default action.
The `addLoudName` action used above is an example.
 
Example custom actions with `addLoudName` are below:

```js
var Dispatcher = require('p-flux').Dispatcher;

var customNameActions = {
  addLoudName(name) {
    Dispatcher.dispatch({type: 'addName', data: name.toUpperCase()});
  },
  
  addQuietName(name) {
    Dispatcher.dispatch({type: 'addName', data: name.toLowerCase()});  
  }
}
```
## Recommended Practices

See [React Starter](https://github.com/pivotal-cf/react-starter) for a basic use case.

### Composite Events

Generally, we encourage actions to only be responsible for one dispatcher event. 
This makes sure that all events go through
the `onDispatch` callback. This makes debugging much easier, especially finding race conditions. 
However, it is common to want an action to trigger multiple events. To do this, we recommend
dispatching events from dispatcherHandlers.

An example of a composite event is below. It will fetch a list of users and then add that list
to the store.

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
Note that `store` is just a javascript object and is not strictly immutable.
While it is possible, **do not update the store manually**. Doing this will cause data to be out of sync. 
Always use the `$store` variable and the Cursor API to update the data.

### Data Outside the Store

**Do not store any data you want to share between components on state.** 
This can cause data synchronization issues. Using state should be rare. 
We recommend using state only for truly private data in a component.
Examples are booleans for whether a dropdown is open or a checkbox is checked. 
Even these are sometimes not private.
