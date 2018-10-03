# lambda router

## sample

### src/app.js
```
const lambdaRouter = require ("lambda-router20");

const test = (event, context, callback) => {
  const response = {
    'statusCode': 200,
    'body': JSON.stringify({
      message: 'test',
    }),
  };
  return callback(null, response)
};

const hello = (event, context, callback) => {
  const response = {
    'statusCode': 200,
    'body': JSON.stringify({
      message: event.params.message,
    }),
  };
  return callback(null, response)
}

const errorHandler = (code) => {
  return (event) => {
    return {
      'statusCode': code,
      'body': JSON.stringify({
        message: `${code} error`,
      }),
    }
  };
};

lambdaRouter.setInit((event, context) => {
  // some init function
});

lambdaRouter.setRoutes([
  {method: "GET", path: "test", func: test},
  {method: "POST", path: "hello/:message", func: hello }, 
]);

lambdaRouter.setResponseHandlers({
  400: errorHandler(400),
  401: errorHandler(401),
  404: errorHandler(404),
})

lambdaRouter.setErrorCallback((event, error) => {
  console.log(error);
}); 

const router = lambdaRouter.router
  
module.exports = {
  router,
}
```

### template.yaml

```
Resources:
    AWSFunction:
        Type: AWS::Serverless::Function
        Properties:
            Handler: app.router
            CodeUri: src/
            Runtime: nodejs8.10
            Events:
                Topic:
                    Type: Api
                    Properties:
                        Path: /1.0/{proxy+}
                        Method: any

```


### test 
```
$curl -i http://localhost:3000/1.0/test
HTTP/1.0 200 OK
Content-Type: application/json
Content-Length: 18
Server: Werkzeug/0.14.1 Python/3.6.2
Date: Wed, 03 Oct 2018 18:56:45 GMT

{"message":"test"}
```



```
$curl -i  -X POST  http://localhost:3000/1.0/hello/my_message
HTTP/1.0 200 OK
Content-Type: application/json
Content-Length: 24
Server: Werkzeug/0.14.1 Python/3.6.2
Date: Wed, 03 Oct 2018 18:56:58 GMT

{"message":"my_message"} 
```


```
$ curl -i http://localhost:3000/1.0/not_found
HTTP/1.0 404 NOT FOUND
Content-Type: application/json
Content-Length: 23
Server: Werkzeug/0.14.1 Python/3.6.2
Date: Wed, 03 Oct 2018 18:57:29 GMT

{"message":"404 error"}
```



## session sample

### src/app.js

```
const session = require('lambda-router20/lib/session');

const lambdaRouter = require ("lambda-router20");


lambdaRouter.session.setSessionSecret("SET_SECRET_HERE");

const getSession = (event, context, callback) => {
  const sess = session.getSession(event.headers);
  
  const response = {
    'statusCode': 200,
    'body': JSON.stringify({
      session: sess.valid ? sess.data : null,
    }),
  };
  return callback(null, response)
};

const setSession = (event, context, callback) => {
  const options = session.getSessionHeader({status: "ok"});
  
  const response = {
    'statusCode': 200,
    'body': JSON.stringify({
      message: 'test',
    }),
    'headers': options.headers
  };
  return callback(null, response)
};

lambdaRouter.setRoutes([
  {method: "GET", path: "test/setSession", func: setSession},
  {method: "GET", path: "test/getSession", func: getSession},
]);

const router = lambdaRouter.router
  
module.exports = {
  router,
}

```

### test


set cookie

```
$ curl -i http://localhost:3000/1.0/test/setSession
HTTP/1.0 200 OK
Set-Cookie: SID=%7B%22status%22%3A%22ok%22%7D.eTkTgF7CmPnvB9WX2f9JLba5qgXjVf969xI6KdXCVmY; Path=/; Expires=Thu, 04 Oct 2018 07:20:09 GMT
Content-Type: application/json
Content-Length: 18
Server: Werkzeug/0.14.1 Python/3.6.2
Date: Wed, 03 Oct 2018 22:34:33 GMT

{"message":"test"}
```

get cookie

```
$ curl -i -H "Cookie: SID=%7B%22status%22%3A%22ok%22%7D.eTkTgF7CmPnvB9WX2f9JLba5qgXjVf969xI6KdXCVmY;" http://localhost:3000/1.0/test/getSession
HTTP/1.0 200 OK
Content-Type: application/json
Content-Length: 27
Server: Werkzeug/0.14.1 Python/3.6.2
Date: Wed, 03 Oct 2018 22:35:19 GMT

{"session":{"status":"ok"}} 
```

