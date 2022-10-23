import * as AWS from "aws-sdk";
import { parse } from "csv-parse";

import { BUCKET_NAME } from "../../utils";

const importFileParser = async (event: any) => {
    try {
        const s3 = new AWS.S3({ region: "eu-west-1" });

        for (let record of event.Records) {
            const s3Config = {
                Bucket: BUCKET_NAME,
                Key: record.s3.object.key,
            };

            try {
                const results = [];
                s3.getObject(s3Config)
                    .createReadStream()
                    .pipe(
                        parse({
                            delimiter: ";",
                            columns: true,
                        })
                    )
                    .on("data", (data) => {
                        results.push(data);
                        console.log("row: ", data);
                    });

                await s3
                    .copyObject({
                        Bucket: BUCKET_NAME,
                        CopySource: BUCKET_NAME + "/" + record.s3.object.key,
                        Key: record.s3.object.key.replace("uploaded", "parsed"),
                    })
                    .promise();

                await s3
                    .deleteObject({
                        Bucket: BUCKET_NAME,
                        Key: record.s3.object.key,
                    })
                    .promise();
            } catch (err) {
                console.log("Error: ", err);
            }
        }

        return {
            statusCode: 202,
        };
    } catch (error) {
        console.log(error);
    }
};

export const main = importFileParser;
