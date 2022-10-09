import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { productsMock } from "../../products.mock";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<
    typeof schema
> = async () => {
    return formatJSONResponse({
        products: await productsMock.find(),
    });
};

export const main = middyfy(getProductsList);
