import React from 'react';
import classNames from 'classnames';

export default class NonReact extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      delegate: new props.delegate,
    };
  }

  static defaultProps = {
    element: 'div',
  };

  static propTypes = {
    element: React.PropTypes.string.isRequired,
    delegate: React.PropTypes.func.isRequired,
  };

  componentDidMount() {
    const el = document.createElement(this.props.element);
    this.refs.wrapper.appendChild(el);
    this.innerElement = el;
    this.state.delegate.create(this.innerElement, this.props);
  }

  componentWillUnmount() {
    if (this.state.delegate.destroy != null) {
      this.state.delegate.destroy(this.innerElement, this.props);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    this.state.delegate.update(this.innerElement, nextProps);
    return false;
  }

  render() {
    const cls = classNames('NonReact', this.props.className);
    return <div ref="wrapper" className={cls} />;
  }
}


