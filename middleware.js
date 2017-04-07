import xr from './xr';
import { increaseAppLoader, decreaseAppLoader } from './actionCreators';
import { LOAD_DATA, LOAD_DATA_SUCCESS, LOAD_DATA_ERROR } from './actionTypes';

export function promiseMiddleware(store) {
  return (next) => (action) => {
    if (action.meta && action.meta.promise) {
      action.meta.promise.catch(reason => {
        console.log(reason);
      }).then(res => {
        // on success dispatch success action if available
        if (action.meta.onSuccessAction != null) {
          store.dispatch(action.meta.onSuccessAction());
        }

        return next({
          type: action.type,
          payload: res,
        });
      });
    } else {
      return next(action);
    }
  };
}

const apiMiddlewareLastId = {};

export function apiMiddleware() {
  return (next) => (action) => {
    if (action.meta && action.meta.api) {
      const id = (apiMiddlewareLastId[action.type] || 0) + 1;
      apiMiddlewareLastId[action.type] = id;
      action.meta.api.forEach(api => {
        next(increaseAppLoader());

        xr.get(api.url, api.params || {})
          .catch(error => { next(decreaseAppLoader()); console.log(error); })
          .then(data => {
            next(decreaseAppLoader());
            if (id === apiMiddlewareLastId[action.type]) {
              next({
                type: action.type,
                meta: api,
                payload: data,
              });
            } else {
              console.log('Outdated API response');
            }
          });
      });
    } else {
      return next(action);
    }
  };
}


const loadDataLastId = {};

export function loadDataMiddleware() {
  return (next) => (action) => {
    if (action.type === LOAD_DATA) {
      const {statePath, resource, params, transform} = action.payload;

      const id = (loadDataLastId[statePath] || 0) + 1;
      next(action);
      loadDataLastId[statePath] = id;

      const url = '/api/' + resource + (resource.endsWith('/') ? '' : '/');

      xr.get(url, params)
        .catch(error => {
          console.log(error);
          // TODO: make errors more meaningful
          next({
            type: LOAD_DATA_ERROR,
            payload: {
              statePath,
              resource,
              params,
              data: null,
              error: 'Error loading data',
            },
          });
        })
        .then(data => {
          if (id === loadDataLastId[statePath]) {
            next({
              type: LOAD_DATA_SUCCESS,
              payload: {
                statePath,
                resource,
                params,
                data: transform != null ? transform(data) : data,
              },
            });
          } else {
            console.log('Outdated API response');
          }
        });
    } else {
      return next(action);
    }
  };
}


