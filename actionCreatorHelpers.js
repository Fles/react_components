
export function fetch(type, url) {
  return (params = {}) => ({
    type,
    meta: {api: [{url: '/api/' + url, params}]},
  });
}

export function setter(type) {
  return (payload) => ({type, payload});
}


