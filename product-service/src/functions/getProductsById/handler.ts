import * as AWS from "aws-sdk";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";

const dynamo = new AWS.DynamoDB.DocumentClient();

const queryProducts = async (id: string): Promise<any> => {
    const result = await dynamo
        .query({
            TableName: process.env.PRODUCTS_TABLE,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: { ":id": id },
        })
        .promise();
    if (result.Items.length > 0) return result.Items[0];
    return null;
};

const queryStocks = async (id: string): Promise<any> => {
    const result = await dynamo
        .query({
            TableName: process.env.STOCKS_TABLE,
            KeyConditionExpression: "productId = :id",
            ExpressionAttributeValues: { ":id": id },
        })
        .promise();
    if (result.Items.length > 0) return result.Items[0];
    return null;
};

const getProductById: ValidatedEventAPIGatewayProxyEvent<
    typeof schema
> = async (event) => {
    try {
        const { id } = event.pathParameters;
        console.log("getProductById called with params: ", id)
        const product = await queryProducts(id);

        if (!product)
            return formatJSONResponse(
                { error: `Product by id: ${id} NOT found` },
            );

        const stock = await queryStocks(id);

        product.count = stock ? stock.count : 0;
        return formatJSONResponse({
            product: product,
        });
    } catch (error) {
        return formatJSONResponse({
            error: error,
        }, 500);
    }
};

export const main = middyfy(getProductById);
