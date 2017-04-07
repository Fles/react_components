import React from 'react';
import { shallowEqual } from '../helpers';
export class D3 {
  create  (el, props) { console.log('D3: create', el); }
  update  (el, props) { console.log('D3: update', el); }
  destroy (el, props) { console.log('D3: destroy', el); }
}
export const D3Component = React.createClass({
  getDefaultProps: function () {
    return {d3: new D3()};
  },
  getContainer: function () {
    var el = this.refs.container;
    return el;
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState);
  },
  componentDidMount: function () {
    this.props.d3.create(this.getContainer(), this.props);
  },
  componentDidUpdate: function () {
    this.props.d3.update(this.getContainer(), this.props);
  },
  componentWillUnmount: function () {
    this.props.d3.destroy(this.getContainer(), this.props);
  },
  render: function() {
    return <div ref='container' className={this.props.class + " Graph"}></div>;
  }
});
