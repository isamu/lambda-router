'use strict';

const router = require('../../lib/router.js');

const chai = require('chai');
const expect = chai.expect;


var context;

const test = (event, context, callback) => {
  const response = {
    'statusCode': 200,
    'body': JSON.stringify({
      message: 'mock',
    }),
  };
  return callback(null, response)
};

describe('Tests index', function () {
  before(() => {
    router.setRoutes([
      {method: "GET", path: "test", func: test},
    ]);
  });
  
  it('verifies successful response1 ', async () => {
    this.timeout(5000);
    const event = {
      requestContext: {
        stage: "prod",
      },
      params: {
        id: 2,
      },
      headers: {
        origin: "123",
      },
    };
  });

  it('verifies good response', async () => {
    const event = {
      httpMethod: "GET",
      pathParameters: {
        proxy: "test"
      }
    };

    const result = await router.router(event, context, (err, result) => {
      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(200);
      expect(result.body).to.be.an('string');
      
      let response = JSON.parse(result.body);
      expect(response).to.be.an('object');
    });
  });


  it('verifies 404 response', async () => {
    const event = {
      httpMethod: "GET",
      pathParameters: {
        proxy: "bad"
      }
    };

    const result = await router.router(event, context, (err, result) => {
      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(404);
      expect(result.body).to.be.an('string');
      
      let response = JSON.parse(result.body);
      expect(response).to.be.an('object');
    });
  });
  
  
});

