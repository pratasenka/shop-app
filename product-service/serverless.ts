import type { AWS } from "@serverless/typescript";

import getProductsList from "@functions/products";
import getProductById from "@functions/getProductsById";
import createProduct from "@functions/createProduct";
import catalogBatchProcess from "@functions/catalogBatchProcess";

const serverlessConfiguration: AWS = {
    service: "product-service",
    frameworkVersion: "3",
    plugins: ["serverless-esbuild", "serverless-dynamodb-local"],
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
            PRODUCTS_TABLE: "Products",
            STOCKS_TABLE: "Stocks",
            SQS_URL: "SQSQueue",
            SNS_ARN: {
                Ref: "SNSTopic",
            },
        },
        iam: {
            role: {
                statements: [
                    {
                        Effect: "Allow",
                        Action: [
                            "dynamodb:DescribeTable",
                            "dynamodb:Query",
                            "dynamodb:Scan",
                            "dynamodb:GetItem",
                            "dynamodb:PutItem",
                            "dynamodb:UpdateItem",
                            "dynamodb:DeleteItem",
                        ],
                        Resource: "arn:aws:dynamodb:eu-west-1:*:table/Products",
                    },
                    {
                        Effect: "Allow",
                        Action: [
                            "dynamodb:DescribeTable",
                            "dynamodb:Query",
                            "dynamodb:Scan",
                            "dynamodb:GetItem",
                            "dynamodb:PutItem",
                            "dynamodb:UpdateItem",
                            "dynamodb:DeleteItem",
                        ],
                        Resource: "arn:aws:dynamodb:eu-west-1:*:table/Stocks",
                    },
                    {
                        Effect: "Allow",
                        Action: ["sqs:*"],
                        Resource: {
                            "Fn::GetAtt": ["SQSQueue", "Arn"],
                        },
                    },
                    {
                        Effect: "Allow",
                        Action: ["sns:*"],
                        Resource: {
                            Ref: "SNSTopic",
                        },
                    },
                ],
            },
        },
    },
    functions: {
        getProductById,
        getProductsList,
        createProduct,
        catalogBatchProcess,
    },
    package: { individually: true },
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
        dynamodb: {
            start: {
                port: 5000,
                inMemory: true,
                migrate: true,
            },
            stages: "dev",
        },
    },
    resources: {
        Resources: {
            Products: {
                Type: "AWS::DynamoDB::Table",
                Properties: {
                    TableName: "Products",
                    AttributeDefinitions: [
                        {
                            AttributeName: "id",
                            AttributeType: "S",
                        },
                    ],
                    KeySchema: [
                        {
                            AttributeName: "id",
                            KeyType: "HASH",
                        },
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1,
                    },
                },
            },
            Stocks: {
                Type: "AWS::DynamoDB::Table",
                Properties: {
                    TableName: "Stocks",
                    AttributeDefinitions: [
                        {
                            AttributeName: "productId",
                            AttributeType: "S",
                        },
                    ],
                    KeySchema: [
                        {
                            AttributeName: "productId",
                            KeyType: "HASH",
                        },
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1,
                    },
                },
            },
            SNSTopic: {
                Type: "AWS::SNS::Topic",
                Properties: {
                    TopicName: "CatalogItemsTopic",
                },
            },
            SNSSubscription: {
                Type: "AWS::SNS::Subscription",
                Properties: {
                    Endpoint: "anton_pratasenka@epam.com",
                    Protocol: "email",
                    TopicArn: {
                        Ref: "SNSTopic",
                    },
                },
            },
            SQSQueue: {
                Type: "AWS::SQS::Queue",
                Properties: {
                    QueueName: "CatalogItemsQueue",
                },
            },
        },
    },
};

module.exports = serverlessConfiguration;
