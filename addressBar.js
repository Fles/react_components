import Immutable from 'immutable';
import { createHistory, useBasename, useQueries } from 'history';
import { setRoute } from './actionCreators'
import { shallowEqual } from './helpers';

const history = useQueries(useBasename(createHistory))({basename: '/'});

function pathMatchesRoute(path, route) {
  if (path.length != route.length) return false;
  const len = path.length;
  for (let i = 0; i < len; i++) {
    if (route[i] !== path[i] && !route[i].startsWith(':')) return false;
  }
  return true;
}

function extractParamsFromURL(path, query, routeInfo) {
  const route = routeInfo.route,
        routeParams = routeInfo.params,
        rawParams = {},
        params = {};

  // extract from path
  const len = path.length;
  for (let i = 0; i < len; i++) {
    const r = route[i], p = path[i];
    if (r.startsWith(':')) {
      const param = r.substr(1);
      if (routeParams[param] != null) {
        let paramToState = routeParams[param].paramToState;
        rawParams[param] = p;
        if (paramToState == null) {
          params[param] = p;
        } else {
          params[param] = paramToState(p);
        }
      }
    }
  }

  // extract from query
  Object.keys(routeParams).forEach(param => {
    if (query[param] == null) return;

    let paramToState = routeParams[param].paramToState;

    rawParams[param] = query[param];
    if (paramToState == null) {
      params[param] = query[param];
    } else {
      params[param] = paramToState(query[param]);
    }
  });

  return [params, rawParams];
}

function findRoute(path, query, routes) {
  const r = routes.find(({route}) => pathMatchesRoute(path, route));
  if (r == null) return [path, {}, {}, r];
  const [params, rawParams] = extractParamsFromURL(path, query, r);
  return [r.route, params, rawParams, r];
}

function equalLists(l0, l1) {
  if (l0.length != l1.length) return false;
  const len = l0.length;
  for (let i = 0; i < len; i++) if (l0[i] != l1[i]) return false;
  return true;
}

function extractParamsFromState(routeParams, state) {
  const params = {};
  Object.keys(routeParams).forEach(param => {
    const {stateToParam, path} = routeParams[param];
    if (stateToParam == null) {
      params[param] = state.getIn(path);
    } else {
      params[param] = stateToParam(state.getIn(path));
    }
  });
  return params;
}

function getRouteAndParams(state, routes) {
  const route = state.get('route'),
        routeArr = route.toJS(),
        routeInfo = routes.find(r => equalLists(r.route, routeArr)),
        routeParams = routeInfo == null ? {} : routeInfo.params,
        params = extractParamsFromState(routeParams, state);
  return [route, params, routeParams];
}

function createURLFromRoute(route, params) {
  params = Object.assign({}, params); // copy params
  const builtRoute = route.map(r => r.startsWith(':') ? params[r.substr(1)] : r);
  const routeParams = route.filter(r => r.startsWith(':'));

  const queryParams = [];
  Object.keys(params).forEach(param => {
    if (route.indexOf(':' + param) !== -1) return;
    if (params[param] == null) return;
    queryParams.push(param + '=' + params[param]);
  });

  if (queryParams.length === 0) {
    return builtRoute.join('/');
  } else {
    return builtRoute.join('/') + '?' + queryParams.join('&');
  }
}

function shouldReplaceHistory(prevParams, params, routeParams) {
  for (let key in routeParams) {
    if (routeParams.hasOwnProperty(key)) {
      let p = routeParams[key];
      if (p.replaceHistory && prevParams[key] !== params[key]) return true;
    }
  }

  return false;
}

export function connectAddressBar(store, routes=[]) {
  let [prevRoute, prevRawParams] = getRouteAndParams(store.getState(), routes);


  store.subscribe(() => {
    let [route, params, routeParams] = getRouteAndParams(store.getState(), routes);

    if (route.equals(prevRoute) && shallowEqual(prevRawParams, params)) return;

    let shouldReplace = shouldReplaceHistory(prevRawParams, params, routeParams);

    prevRoute = route;
    prevRawParams = params;

    if (shouldReplace) {
      history.replace(createURLFromRoute(route, params));
    } else {
      history.push(createURLFromRoute(route, params));
    }
  });

  history.listen((location) => {
    const path  = location.pathname.split('/').filter(v => v != ''),
          query = location.query;

    let [route, params, rawParams, routeObject] = findRoute(path, query, routes);

    if (Immutable.fromJS(route).equals(prevRoute) &&
        shallowEqual(prevRawParams, rawParams, true)) return;

    //console.log('New URL: ', route, prevRawParams, rawParams);

    store.dispatch(setRoute(route, params, routeObject));
  });
}



