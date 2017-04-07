import Immutable from 'immutable';


export function nestReducers(model) {
  let reducers = [], path = [];

  const traverse = (m) => {
    let type = typeof(m)
    if (type === 'function') {
      reducers.push([[...path], m]);
    } else if (type === 'object') {
      for (let key in m) {
        if(m.hasOwnProperty(key)) {
            path.push(key);
            traverse(m[key]);
            path.pop();
        }
      }
    }
  };

  traverse(model);

  return (state, action) => {
    let len = reducers.length;
    for (let i = 0; i < len; i++) {
      let [key, reducer] = reducers[i],
          s0 = state.getIn(key, Immutable.Map()),
          s1 = reducer(s0, action);
      if (s0 !== s1) state = state.setIn(key, s1);
    }
    return state;
  }
}

export function chainReducers(chain) {
  const length = chain.length;
  return (state, action) => {
    for (var i=0; i < length; i++) {
      state = chain[i](state, action);
    }
    return state;
  }
}


