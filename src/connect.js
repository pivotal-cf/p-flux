import Cursor from 'pui-cursor';
import React from 'react';
import Dispatcher from './dispatcher';
import {initializeActions, resetActions} from './actions_manager';

export default function connect(options = {}) {
  return function(Component) {
    return class Connect extends React.Component {
      constructor(props, context) {
        const {store = {}, dispatcherHandlers, actions, onDispatch} = options;
        super(props, context);
        this.state = { store };
        Dispatcher.initialize({dispatcherHandlers, onDispatch});
        initializeActions({dispatcherHandlers, actions});
      }

      static reset() {
        Dispatcher.reset();
        resetActions();
        const {dispatcherHandlers, actions, onDispatch} = options;
        Dispatcher.initialize({dispatcherHandlers, onDispatch});
        initializeActions({dispatcherHandlers, actions});
      }

      render() {
        const props = this.props;
        Dispatcher.$store = new Cursor(this.state.store, store => this.setState({store}));
        return (<Component {...props} {...this.state}/>);
      }
    };
  };
}