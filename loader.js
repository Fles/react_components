import React from 'react';
import classNames from 'classnames';

export default class Loader extends React.Component {
  static defaultProps = {
    isLoaded: true,
    spinner: false,
    spinnerTop: '50%',
    spinnerClass: '',
    initialSpinner: false,
    overlay: false,
    alwaysShowChildren: false,
    initialShowChildren: false,
    showPreviousChildren: false,
    className: '',
    oldDataOpacity: false,
    width: 'auto',
    height: 'auto',
  }

  constructor(props) {
    super(props);

    this.state = {
      prevChildren: props.children,
      prevLoaded: props.isLoaded,
      initial: !props.isLoaded,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.isLoaded && prevProps != this.props) {
      this.setState({
        prevChildren: this.evalChildren(),
        initial: false,
      });
    }
  }

  render() {
    const props = this.props,
          state = this.state;

    const {isLoaded, overlay, className, width, height} = this.props;

    const oldData = props.showPreviousChildren && !isLoaded &&
               !state.initial && !props.alwaysShowChildren;

    const style = {
      width: !isLoaded && this.getWidthHeight(width),
      height: !isLoaded &&  this.getWidthHeight(height),
    };

    const spinnerStyle = {top: props.spinnerTop},
          spinnerClass = classNames('spinner', props.spinnerClass),
          showSpinner = !isLoaded && (props.spinner || (
            props.initialSpinner && state.initial));

    const cls = classNames('Loader', className, {
      loading: !isLoaded,
      oldDataOpacity: oldData && props.oldDataOpacity,
      oldData,
    });

    let children = null,
        showCurrentChildren = isLoaded || props.alwaysShowChildren || (
          state.initial && props.initialShowChildren);

    if (showCurrentChildren) {
      children = this.evalChildren();
    } else if (!isLoaded && props.showPreviousChildren && !state.initial) {
      children = this.state.prevChildren;
    }

    return (
      <div className={cls} style={style}>
        { showSpinner && overlay && <div className="overlay" /> }
        { showSpinner && <div className={spinnerClass} style={spinnerStyle} /> }
        { children }
      </div>
    );
  }

  evalChildren() {
    // every loader child needs to have a unique key
    const newChildren = [];
    if (Array.isArray(this.props.children)) {
      this.props.children.forEach(child => {
        if (React.isValidElement(child)) {
          newChildren.push(child);
        } else if (typeof child === 'function') {
          newChildren.push(child());
        }
      });
      return newChildren;
    } else {
      const child = this.props.children;
      if (React.isValidElement(child)) {
        return child;
      } else if (typeof child === 'function') {
        return child();
      } else {
        return null;
      }
    }
  }

  getWidthHeight(wh) {
    if (typeof(wh) === 'string') {
      return wh;
    } else if (typeof(wh) === 'number') {
      return `${wh}px`;
    } else {
      return 'auto';
    }
  }
}


