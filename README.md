A simple implementation of flux, used across Pivotal CF teams. See [React Starter](https://github.com/pivotal-cf/react-starter) for a basic use case.

```
npm install p-flux --save
```

Readme still under construction...

## Usage


### useStore

The version of flux implemented with `p-flux` fundamentally uses a `store`, `Actions` and a `Dispatcher`. 

The `store` is all of the data in your application. It should be injected into your entry point using the `useStore` method:

```js
const React = require('react');
const {useStore} = require('p-flux');

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

const ApplicationWithStore = useStore(Application, options);
  
module.exports = ApplicationWithStore;
```

The `options` to `useStore` are:

| option | default | description |
| --- | --- | --- |
| `store` | `{}` | An object containing the initial state of your store on page load. This will be injected into `this.props.store` |
| `dispatcherHandlers` | `[]` | An array of objects responsible for handling events from the dispatcher |
| `actions` | `[]` | An array of objects responsible for custom actions |
| `onDispatch` | none | A callback that will be called with the event on every dispatch |

### Dispatcher

The dispatcher owns the store and is the only one who should be allowed to change it. The dispatcher has a `dispatch` method for firing events

```
var Dispatcher = require('p-flux').Dispatcher
Dispatcher.dispatch({type: 'addName', data: 'Bob'});
```

The `dispatch` method is intended to be called from Actions or dispatcherHandlers, but not directly from React Components.
When a dispatcher event is fired, the Dispatcher delegates the event to the appropriate 
dispatcher handler after calling the `onDispatch` callback with the event passed to `dispatch`.

The Dispatcher has a `$store` key, which is an instance of
[PUI Cursor](https://github.com/pivotal-cf/pui-cursor).  An example dispatcherHandler might look like:

```js
{
  addName({data}) {
    this.$store.refine('names').push(data);
  },
  
  resetNames() {
    this.$store.merge({names: []});
  }
}
```


### Actions

`Actions` are globally available functions that present the only interface React Components should use to update data

```js
var Actions = require('p-flux').Actions;
var React = require('react')

class MyComponent extends React.Component {
  static propTypes = {
    names: React.PropsTypes.array.isRequired
  };
  
  doStuff() {
    Actions.addName('Alice');
  }

  render() {
    return (
        <div>
          {this.props.names.slice(-1)[0]}
          <button onClick={this.addOne}>Click Me to Add Alice</button>
        </div>
    );
  }
}
```

To reduce boilerplate, `p-flux` automatically adds an action for each dispatcher event that is handled. 
If no overriding actions are given to `useStore`, 
`Actions.addName('Alice')` is equivalent to `Dispatcher.dispatch({type: 'addName', data: 'Alice'})`.

If you would like to have more semantic actions, you can provide action overrides like:

```js
var Dispatcher = require('p-flux').Dispatcher;

{
  addLoudName(name) {
    Dispatcher.dispatch({type: 'addName', data: names.toUpperCase()});
  }
}
```

