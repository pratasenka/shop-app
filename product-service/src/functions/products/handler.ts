import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { productsMock } from "../../products.mock";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<
    typeof schema
> = async (event) => {
    formatJSONResponse({
        products: productsMock,
    });

    const response = {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        ...formatJSONResponse({
            products: await productsMock.find(),
        }),
    };

    return response;
};

export const main = middyfy(getProductsList);
