'use strict';

const session = require('../../lib/session.js');

const chai = require('chai');
const expect = chai.expect;


var context;

describe('Tests index', function () {
  before(() => {
    session.setSessionSecret("123");
  });
  
  it('verifies get session', async () => {
    const sessinData = session.setSession({"test": "value"});
    expect(sessinData.Cookie.indexOf("Max-Age=31536000000;") > 0).to.equal(true)
  });

  it('verifies get session2 ', async () => {
    session.setCookieOptions({maxAge: 0})
    const sessinData = session.setSession({"test": "value"});
    expect(sessinData.Cookie.indexOf("Max-Age=0;") > 0).to.equal(true)
  });
  
  
});

