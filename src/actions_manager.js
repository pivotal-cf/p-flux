const Actions = require('./actions');
const Dispatcher = require('./dispatcher');

module.exports = {
  initializeActions({actions = [], dispatcherHandlers = []}) {

    //Create default actions for each dispatch event
    dispatcherHandlers.forEach(dispatcherHandler => {
      Object.keys(dispatcherHandler).forEach(dispatchMethod => {
        Actions[dispatchMethod] = (data, options = {}) => Dispatcher.dispatch({type: dispatchMethod, data, ...options});
      });
    });

    //delegate to actions
    actions.forEach(action => {
      Object.keys(action).forEach(actionMethod => {
        Actions[actionMethod] = action[actionMethod];
      });
    });
  },

  resetActions() {
    Object.keys(Actions).forEach(actionMethod => {
      delete Actions[actionMethod];
    });
  }
};
