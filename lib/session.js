const cookie = require('cookie');
const signature = require('cookie-signature');

const cookieKey = 'SID';
let sessionSecret = null;
let cookieOptions = {};

class Session {
  static setSessionSecret(secret) {
    sessionSecret = secret;
  }
  static getSessionSecret() {
    return sessionSecret;
  }
  static setCookieOptions(opt) {
    cookieOptions = opt;
  }
  static getCookieOptions() {
    return cookieOptions;
  }
  
}
const setSessionSecret = (secret) => {
  Session.setSessionSecret(secret)
}
const setCookieOptions = (opt) => {
  Session.setCookieOptions(opt);
}
const getSession = (headers) => {
  const cookieStr = headers ? (headers.Cookie || '') : '';
  const cookies = cookie.parse(cookieStr);
  if (!cookies[cookieKey]) {
    return {
      valid: false
    };
  }
  const sessionData = signature.unsign(cookies[cookieKey], Session.getSessionSecret());
  
  if (!sessionData) {
    return {
      valid: false
    };
  }
  return {
    valid: true,
    data: JSON.parse(sessionData),
  };
};

const setSession = (data) => {
  const sessionData = JSON.stringify(data);
  const sessionPayload = signature.sign(sessionData, Session.getSessionSecret());
  const options = Object.assign({
    path: "/",
    maxAge : 3600 * 24 * 365 * 1000,
  }, Session.getCookieOptions());
  const newCookie = cookie.serialize(cookieKey, sessionPayload, options);
  return { Cookie: newCookie };
}

const destroySession = () => {
  const clearCookie = cookie.serialize(cookieKey, 'empty', {
    maxAge: 0,
    path: "/",
    expires : new Date(Date.now() - 3600 * 24 * 1000) 
  });
  return { Cookie: clearCookie };
}
const getDestroyHeader = () => {

  const sess = destroySession();

  const options = !(sess && sess.Cookie) ? null : {
    headers: {
      "Set-Cookie": sess.Cookie
    }
  };
  return options;
}
const getSessionHeader = (payload) => {
  // create session
  const sess = setSession(payload);

  const options = !(sess && sess.Cookie) ? null : {
    headers: {
      "Set-Cookie": sess.Cookie
    }
  };
  return options;
}
module.exports = {
  getSession,
  setSession,
  setCookieOptions,
  destroySession,
  getSessionHeader,
  destroySession,
  getDestroyHeader,
  setSessionSecret,
}
