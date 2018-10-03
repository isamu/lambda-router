const cookie = require('cookie');
const signature = require('cookie-signature');

const cookieKey = 'SID';
let sessionSecret = null;

class Session {
  static setSessionSecret(secret) {
    sessionSecret = secret;
  }
  static getSessionSecret() {
    return sessionSecret;
  }
  
}
const setSessionSecret = (secret) => {
  Session.setSessionSecret(secret)
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
  const newCookie = cookie.serialize(cookieKey, sessionPayload, {
    path: "/",
    expires : new Date(Date.now() + 3600 * 24 * 365)
  });
  return { Cookie: newCookie };
}

const destroySession = () => {
  const clearCookie = cookie.serialize(cookieKey, 'empty', {
    maxAge: 0,
    path: "/",
    expires : new Date(Date.now() - 3600 * 24) 
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
  destroySession,
  getSessionHeader,
  destroySession,
  getDestroyHeader,
  setSessionSecret,
}
