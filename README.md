# lambda router



## src/app.js
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

## template.yaml

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


## test 
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
