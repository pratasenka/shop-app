import * as AWS from "aws-sdk";
import { parse } from "csv-parse";

import { BUCKET_NAME } from "../../utils";

const importFileParser = async (event: any) => {
    try {
        for (let record of event.Records) {
            await fileParser(record);
        }

        return {
            statusCode: 202,
        };
    } catch (error) {
        console.log(error);
    }
};

const fileParser = async (record) => {
    return new Promise((resolve, reject) => {
        const s3 = new AWS.S3({ region: "eu-west-1" });
        const sqs = new AWS.SQS();

        const s3Config = {
            Bucket: BUCKET_NAME,
            Key: record.s3.object.key,
        };

        try {
            s3.getObject(s3Config)
                .createReadStream()
                .pipe(
                    parse({
                        delimiter: ";",
                        columns: true,
                    })
                )
                .on("data", (data) => {
                    sqs.sendMessage(
                        {
                            QueueUrl: process.env.SQS_URL,
                            MessageBody: JSON.stringify(data),
                        },
                        (error, sendData) => {
                            if (!error)
                                console.log("succ send to SQS: ", sendData);
                            else console.log("error on send to SQS: ", error);
                        }
                    );
                })
                .on("end", async () => {
                    console.log("stream Done");

                    await s3
                        .copyObject({
                            Bucket: BUCKET_NAME,
                            CopySource:
                                BUCKET_NAME + "/" + record.s3.object.key,
                            Key: record.s3.object.key.replace(
                                "uploaded",
                                "parsed"
                            ),
                        })
                        .promise();

                    await s3
                        .deleteObject({
                            Bucket: BUCKET_NAME,
                            Key: record.s3.object.key,
                        })
                        .promise();
                });
        } catch (err) {
            console.log("Error: ", err);
        }
    });
};

export const main = importFileParser;
