import * as AWS from "aws-sdk";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { nanoid } from "nanoid";

import schema from "./schema";
import { eventNames } from "process";

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

const parseRequest = (body): any => {
    if (!body.title) return { ok: false, msg: "Title was not provided" };
    if (!body.description)
        return { ok: false, msg: "Description was not provided" };
    if (!body.price) return { ok: false, msg: "Price was not provided" };

    return {
        ok: true,
        title: body.title,
        description: body.description,
        price: body.price,
    };
};

const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
    event
) => {
    try {
        console.log("createProduct called with params: ", event.body);
        const body = parseRequest(event.body);

        if (!body.ok)
            return formatJSONResponse(
                {
                    error: body.msg,
                },
                400
            );

        const { title, description, price, count } = event.body;

        if (!title && !description && !price) throw "Invalid Input";

        const productId = nanoid();

        const product = await putProduct({
            id: productId,
            title: title,
            description: description,
            price: price,
        });

        const stockInfo = await putStock({
            productId: productId,
            count: count ? count : 0,
        });

        product.count = stockInfo.count;
        return formatJSONResponse({
            createdProduct: {
                id: productId,
                title: title,
                description: description,
                price: price,
                count: count ? count : 0,
            },
        });
    } catch (error) {
        formatJSONResponse({
            error: error,
        }, 500);
    }
};

export const main = middyfy(createProduct);
