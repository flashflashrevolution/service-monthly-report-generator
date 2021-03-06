import { ImportEnvironmentVariables } from "./Config";
ImportEnvironmentVariables();

import * as OAuth from 'simple-oauth2';
import * as TypeORM from 'typeorm';
//import { CreatePatreonTokenFromOAuthToken } from "patreon-ts/dist/types";
import { Entities, Initialize } from "@flashflashrevolution/database-entities";

const mongoConstants =
{
    username: process.env.MONGO_USER as string,
    password: process.env.MONGO_PASS as string,
    uri: process.env.MONGO_URI as string,
    databaseName: process.env.MONGO_DATABASE as string,
    retryWrites: "true",
    writes: "majority",
};

const sqlPatreonConstants =
{
    host: process.env.SQL_HOST as string,
    dbName: process.env.SQL_PATREON_DB_NAME as string,
    dbUser: process.env.SQL_PATREON_DB_USER as string,
    dbPass: process.env.SQL_PATREON_DB_PASS as string,
};

const connectionOptions: TypeORM.ConnectionOptions =
{
    name: sqlPatreonConstants.dbName,
    type: "mysql",
    host: sqlPatreonConstants.host,
    port: 3306,
    username: sqlPatreonConstants.dbUser,
    password: sqlPatreonConstants.dbPass,
    database: sqlPatreonConstants.dbName,
    entities: [Entities.PatreonLink]
};

const patreonConstants =
{
    clientId: process.env.PATREON_CLIENT_ID as string,
    clientSecret: process.env.PATREON_CLIENT_SECRET as string,
    campaignId: process.env.PATREON_CAMPAIGN_ID as string,
};

const patreonOAuthConstants =
{
    host: "https://www.patreon.com",
    tokenPath: "/api/oauth2/token",
    authorizePath: "/oauth2/authorize",
    scopes: "identity campaigns identity.memberships campaigns.members",
};

const patreonOAuthCredentials: OAuth.ModuleOptions =
{
    client:
    {
        id: patreonConstants.clientId,
        secret: patreonConstants.clientSecret
    },
    auth:
    {
        tokenHost: patreonOAuthConstants.host,
        tokenPath: patreonOAuthConstants.tokenPath,
        authorizePath: patreonOAuthConstants.authorizePath
    }
};

const client: OAuth.AuthorizationCode = new OAuth.AuthorizationCode(patreonOAuthCredentials);
console.log(client);
// Get the access token for the campaign. Set as the primary access token.
// Set a timer for checking the validity of the token and refresh token.
//  When necessary, refresh the access token and update the database.
//  
//let accessToken: OAuth.AccessToken = client.createToken(JSON.parse(accessTokenJSONString));


async function ConnectToSql()
{
    await Initialize(connectionOptions)
        .then((connection: TypeORM.Connection) =>
        {
            console.log("Successfully connected to the database: " + connection.name);
        })
        .catch((reason: string) =>
        {
            console.error(reason);
        });
}

async function BuildTestModel()
{
    const report = new MonthlyReport();
    await report.save();
    const user = await MonthlyReport.findOne();
    console.log(user);
}

async function DoWork()
{
    await ConnectToSql();
    await BuildTestModel();
}

DoWork().finally(() =>
{
    console.log("done")
});
