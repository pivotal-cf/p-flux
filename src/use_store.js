const Cursor = require('pui-cursor');
const Dispatcher = require('./dispatcher');
const {initializeActions, resetActions} = require('./actions_manager');
const mixin = require('pui-react-mixins');
const Mounted = require('pui-react-mixins/mixins/mounted_mixin');
const React = require('react');

const useStore = (Component, options = {}) => class extends mixin(React.Component).with(Mounted) {
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
    Dispatcher.$store = new Cursor(this.state.store, store => this.mounted() && this.setState({store}));
    return (<Component {...props} {...this.state}/>);
  }
};

module.exports = useStore;
