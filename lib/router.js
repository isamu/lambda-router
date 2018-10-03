const validator = require('validator');
const requests = require ('./requests');
const session = require('./session');

const deepmerge = require('deepmerge');

const pathMatch = require ('path-match')({
  sensitive: false,
  strict: false,
  end: true,
});;

const auth = {
  do_auth: 1,
  required: 10,
}

const getFunc = (routes, method, path) => {
  for (const data of routes) {
    const param = (data.path) ? pathMatch(data.path)(path) : {};
    if (data.method === method && param !== false) {
      return [true, data.func, param, data.options || {}];
    }
  }
  return [false, null, null, {}];
}

let routes = [];
let initFunction = (event, context) => {};
let getUser = async (sess, options) => { return null; }
let errroCallback = (event, error) => {};

let responses_functions = {};

const setResponsesFunction = (functions) => {
  responses_functions = functions
}
const setInit = (func) => {
  initFunction = func;
}
const setRoutes = (_routes) => {
  routes = _routes;
}
const setGetUser = (_getUser) => {
  getUser = _getUser;
}
const setErrorCallback = (_errroCallback) => {
  errroCallback = _errroCallback;
}
const router = async (event, context, callback) => {
  initFunction(event, context);
  
  const [res, callFunction, param, options] = getFunc(routes, event.httpMethod, event.pathParameters.proxy);
  
  if (options.authentication) {
    const sess = session.getSession(event.headers);
    event.user = await getUser(sess, options);
    if (event.user === null && options.authentication === auth.required) {
      return callback(null, getResponseFunction(401, event));
    }
  }
  event.params = deepmerge.all([param || {}, event.queryStringParameters || {}, requests.parseData(event)]);
  
  if (res) {
    try {
      await callFunction(event, context, callback);
    } catch (e) {
      errroCallback(event, e);
      callback(null, getResponseFunction(400, event));
    }
  } else {
    callback(null, getResponseFunction(404, event));
  }
}

const getResponseFunction = (code, event) => {
  if (responses_functions[code]) {
    return responses_functions[code](event);
  } else {
    return {
      'statusCode': code,
      'body': JSON.stringify({
        message: code,
      }),
    };
  }
}


module.exports = {
  router,
  setRoutes,
  auth,
  setInit,
  setGetUser,
  setErrorCallback,
  setResponsesFunction,
  session,
}
