require('babel-polyfill');
require('jasmine_dom_matchers');

const Cursor = require('pui-cursor');
const jQuery = require('jquery');
const React = require('react');
const ReactDOM = require('react-dom');

Object.assign(global, {
  jQuery,
  React,
  ReactDOM,
  $: jQuery
});

beforeEach(() => {
  $('body').find('#root').remove().end().append('<div id="root"/>');
  Cursor.async = false;
  jasmine.clock().install();
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(root);
  jasmine.clock().uninstall();
});
