import * as AWS from "aws-sdk";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { BUCKET_NAME } from "../../utils";

import schema from "./schema";

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<
    typeof schema
> = async (event) => {
    const fileName = event.queryStringParameters.name;
    const s3 = new AWS.S3({ region: "eu-west-1" });

    console.log(fileName)

    try {
        const url = await s3.getSignedUrl("putObject", {
            Bucket: BUCKET_NAME,
            Key: `uploaded/${fileName}`,
            ContentType: "text/csv",
            // ACL: "public-read-write",
        });

        return formatJSONResponse({
            signedURL: url,
        });
    } catch (error) {
        console.log(error);
        return formatJSONResponse({
            error: error,
        });
    }
};

export const main = middyfy(importProductsFile);
