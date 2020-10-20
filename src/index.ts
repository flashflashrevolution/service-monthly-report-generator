import { ImportEnvironmentVariables } from "./Config";
ImportEnvironmentVariables();

import mongoose from "mongoose"
import { MonthlyReport } from "./MonthlyPatreonReport"

const mongoUser: string = process.env.MONGO_USER as string;
const mongoPass: string = process.env.MONGO_PASS as string;
const mongoUri: string = process.env.MONGO_URI as string;
const mongoDatabase: string = process.env.MONGO_DATABASE as string;

async function Connect()
{
    const opts = { useNewUrlParser: true, connectTimeoutMS: 1000, poolSize: 10, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true };
    const connectionString = `mongodb+srv://${mongoUser}:${mongoPass}@${mongoUri}/${mongoDatabase}?retryWrites=true&w=majority`;
    await mongoose.connect(connectionString, opts);
}

async function BuildTestModel()
{
    const report = new MonthlyReport({ totalMonths: 8 })
    await report.save()
    const user = await MonthlyReport.findOne();
    console.log(user);
}

async function DoWork()
{
    await Connect();
    await BuildTestModel();
}

DoWork();
