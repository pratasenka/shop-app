import { handlerPath } from "@libs/handler-resolver";

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: "get",
                path: "import",
                cors: true,
                request: {
                    parameters: {
                        querystrings: {
                            name: true,
                        },
                    },
                },
                authorizer: {
                    arn: "arn:aws:lambda:eu-west-1:943623494787:function:authorization-service-dev-basicAuthorizer",
                    identitySource: "method.request.header.Authorization",
                    type: "token",
                },
                responseData: {
                    200: "Successful operation",
                    401: "Unauthorized (no token)",
                    403: "Forbidden (invalid or expired token)",
                    500: "Server error",
                },
            },
        },
    ],
};
