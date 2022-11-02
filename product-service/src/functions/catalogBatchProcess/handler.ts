import * as AWS from "aws-sdk";

import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { nanoid } from "nanoid";

const dynamo = new AWS.DynamoDB.DocumentClient();

const putProduct = async (item): Promise<any> => {
    const result = await dynamo
        .put({
            TableName: process.env.PRODUCTS_TABLE,
            Item: item,
        })
        .promise();

    return result;
};

const putStock = async (item): Promise<any> => {
    const result = await dynamo
        .put({
            TableName: process.env.STOCKS_TABLE,
            Item: item,
        })
        .promise();
    return result;
};

const snsNotification = async (products) => {
    const sns = new AWS.SNS({ region: "eu-west-1" });

    console.log(process.env.SNS_ARN);

    sns.publish(
        {
            Subject: "Products has been created",
            Message: JSON.stringify(products),
            TopicArn: process.env.SNS_ARN,
        },
        (error, data) => {
            if (!error) console.log("error: ", error);
            else console.log("notification succ send: ", data);
        }
    );
};

const saveProduct = async (newProduct) => {
    const productId = nanoid();

    const product = await putProduct({
        id: productId,
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
    });

    const stockInfo = await putStock({
        productId: productId,
        count: newProduct.count ? newProduct.count : 0,
    });

    snsNotification(`${newProduct.title} saved`);

    return {
        id: productId,
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
        count: newProduct.count ? newProduct.count : 0,
    };
};

const catalogBatchProcess = async (event) => {
    try {
        for await (const record of event.Records) {
            const newProduct = JSON.parse(record.body);
            await saveProduct(newProduct);
        }
    } catch (error) {
        return formatJSONResponse(
            {
                error: error,
            },
            500
        );
    }
};

export const main = middyfy(catalogBatchProcess);
