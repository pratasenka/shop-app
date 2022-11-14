import type { AWS } from "@serverless/typescript";

import importProductsFile from "@functions/importProductsFile";
import importFileParser from "@functions/importFileParser";
import { BUCKET_NAME } from "src/utils";

const serverlessConfiguration: AWS = {
    service: "import-service",
    frameworkVersion: "3",
    plugins: ["serverless-esbuild"],
    provider: {
        name: "aws",
        runtime: "nodejs14.x",
        region: "eu-west-1",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
            SQS_URL:
                "https://sqs.eu-west-1.amazonaws.com/943623494787/CatalogItemsQueue",
        },
        iam: {
            role: {
                statements: [
                    {
                        Effect: "Allow",
                        Action: ["s3:ListBucket"],
                        Resource: `arn:aws:s3:::${BUCKET_NAME}`,
                    },
                    {
                        Effect: "Allow",
                        Action: ["s3:*"],
                        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
                    },
                    {
                        Effect: "Allow",
                        Action: ["sqs:*"],
                        Resource:
                            "arn:aws:sqs:eu-west-1:943623494787:CatalogItemsQueue",
                    },
                ],
            },
        },
    },
    // import the function via paths
    functions: { importProductsFile, importFileParser },
    package: { individually: true },
    resources: {
        Resources: {
            GatewayResponseDefault4XX: {
                Type: "AWS::ApiGateway::GatewayResponse",
                Properties: {
                    ResponseParameters: {
                        "gatewayresponse.header.Access-Control-Allow-Origin":
                            "'*'",
                        "gatewayresponse.header.Access-Control-Allow-Headers":
                            "'Content-Type, Authorization'",
                        "gatewayresponse.header.Access-Control-Allow-Methods":
                            "'OPTIONS,GET'",
                        "gatewayresponse.header.Access-Control-Allow-Credentials":
                            "'true'",
                    },
                    ResponseType: "DEFAULT_4XX",
                    RestApiId: {
                        Ref: "ApiGatewayRestApi",
                    },
                },
            },
        },
    },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ["aws-sdk"],
            target: "node14",
            define: { "require.resolve": undefined },
            platform: "node",
            concurrency: 10,
        },
    },
};

module.exports = serverlessConfiguration;
