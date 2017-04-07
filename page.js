import React from 'react';

function hasKeys(obj, keys) {
  if (keys == null) return true;
  return keys.every(k => obj[k] != null);
}

function compareKeys(o1, o2, keys) {
  if (keys == null) return true;
  return keys.every(k => o1[k] === o2[k]);
}

function copyKeys(obj, keys0, keys1) {
  const result = {};
  if (keys0 != null)
    keys0.forEach(key => { if (obj[key] != null) result[key] = obj[key]; });
  if (keys1 != null)
    keys1.forEach(key => { if (obj[key] != null) result[key] = obj[key]; });
  return result;
}


export default class Page extends React.Component {
  componentDidMount() {
    this.handleComponentUpdate(this.props, null);
  }

  componentWillUpdate(nextProps) {
    this.handleComponentUpdate(nextProps, this.props);
  }

  handleComponentUpdate(props, prevProps) {
    if (this.updateListeners == null || this.getUpdateParams == null) return;

    const params = this.getUpdateParams(props),
          prevParams = prevProps == null ? null : this.getUpdateParams(prevProps);

    this.updateListeners.forEach(listener => {
      const {required, optional, onNulled} = listener;

      // check if all required params are set
      if (!hasKeys(params, required)) return;

      if (prevParams == null ||
          !compareKeys(prevParams, params, required) ||
          !compareKeys(prevParams, params, optional)) {
        const newParams = copyKeys(params, required, optional);
        listener.onUpdate(newParams);
      } else if (onNulled != null && prevProps != null &&
          prevProps[onNulled] != null && props[onNulled] == null) {
        // listened prop has been nulled
        const newParams = copyKeys(params, required, optional);
        listener.onUpdate(newParams);
      }
    });
  }
}


