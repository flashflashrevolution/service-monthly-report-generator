import { ImportEnvironmentVariables } from "./Config";
ImportEnvironmentVariables();

import Process from "process";
import mongoose from "mongoose";
import { MonthlyReport } from "./MonthlyPatreonReport";
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
    host: process.env.DB_HOST as string,
    dbName: process.env.DB_PATREON as string,
    dbUser: process.env.DB_PATREON_USER as string,
    dbPass: process.env.DB_PATREON_PASS as string,
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



async function ConnectToMongoDB()
{
    const opts =
    {
        useNewUrlParser: true,
        connectTimeoutMS: 1000,
        poolSize: 10,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true
    };

    const connectionString =
        `mongodb+srv:\
        //${mongoConstants.username}\
        :${mongoConstants.password}\
        @${mongoConstants.uri}\
        /${mongoConstants.databaseName}\
        ?retryWrites=${mongoConstants.retryWrites}\
        &w=${mongoConstants.writes}`;

    await mongoose.connect(connectionString, opts);
}

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
    const report = new MonthlyReport({ totalMonths: 8 });
    await report.save();
    const user = await MonthlyReport.findOne();
    console.log(user);
}

async function DoWork()
{
    await ConnectToMongoDB();
    await ConnectToSql();
    await BuildTestModel();
}

DoWork().finally(() =>
{
    Process.exit(0);
});
