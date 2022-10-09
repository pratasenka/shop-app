import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { productsMock } from "../../products.mock";

const getProductById: ValidatedEventAPIGatewayProxyEvent<
    typeof schema
> = async (event) => {
    const { id } = event.pathParameters;
    return formatJSONResponse({
        product: await productsMock.findById(id),
    });
};

export const main = middyfy(getProductById);
