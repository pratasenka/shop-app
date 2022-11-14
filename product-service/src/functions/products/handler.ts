import * as AWS from "aws-sdk";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
// import { productsMock } from "../../products.mock";

const dynamo = new AWS.DynamoDB.DocumentClient();

const scanProducts = async (): Promise<any> => {
    const result = await dynamo
        .scan({
            TableName: process.env.PRODUCTS_TABLE,
        })
        .promise();
    return result.Items;
};

const scanStocks = async (): Promise<any> => {
    const result = await dynamo
        .scan({
            TableName: process.env.STOCKS_TABLE,
        })
        .promise();
    return result.Items;
};

const getProductsList: ValidatedEventAPIGatewayProxyEvent<
    typeof schema
> = async () => {
    try {
        console.log("getProductsList called");

        const stocks = await scanStocks();
        const products = await scanProducts();
        
        products.map((product) => {
            const stock = stocks.find(
                (stock) => product.id === stock.productId
            );
            product.count = stock ? stock.count : 0;
        });

        return formatJSONResponse({
            products: products,
        });
    } catch (error) {
        return formatJSONResponse({
            error: error,
        }, 500);
    }
};

export const main = middyfy(getProductsList);
