import { middyfy } from "@libs/lambda";

const generatePolicy = (principalId: any, resource: any, effect = "Allow") => {
    return {
        principalId: principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    };
};

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
};

const HttpResponse = {
    badRequest: <T>(data: T = {} as T): any => ({
        statusCode: 400,
        body: JSON.stringify(data),
        headers,
    }),
    notFound: (): any => ({
        statusCode: 404,
        body: JSON.stringify({}),
        headers,
    }),
    noToken: <T>(data: T = {} as T): any => ({
        statusCode: 401,
        body: JSON.stringify(data),
        headers,
    }),
    unauthorized: <T>(data: T = {} as T): any => ({
        statusCode: 200,
        body: JSON.stringify(data),
        headers,
    }),
    success: <T>(data: T = {} as T): any => ({
        statusCode: 200,
        body: JSON.stringify(data),
        headers,
    }),
    serverError: <T>(data: T = {} as T): any => ({
        statusCode: 500,
        body: JSON.stringify(data),
        headers,
    }),
};

const basicAuthorizer = async (event) => {
    if (event?.type !== "TOKEN") return HttpResponse.noToken("Unauthorized");

    try {
        const authToken = event?.authorizationToken;

        const encodedCreds = authToken.split(" ")[1];
        console.log(encodedCreds)
        if (!encodedCreds) return HttpResponse.badRequest("Unauthorized");

        const buff = Buffer.from(encodedCreds, "base64");
        const plainCreds = buff.toString("utf-8").split(":");
        console.log(plainCreds)
        if (!plainCreds) return HttpResponse.badRequest("Unauthorized");

        const [username, password] = plainCreds;

        const storedUserPassword = process.env[username];
        const effect =
            !storedUserPassword || storedUserPassword !== password
                ? "Deny"
                : "Allow";

        const policy = generatePolicy(encodedCreds, event.methodArn, effect);
        console.log(JSON.stringify(policy));
        return policy;
    } catch (err) {
        return HttpResponse.unauthorized(`Unauthorized : ${err.message}`);
    }
};

export const main = basicAuthorizer;
