import { getModelForClass, mongoose, prop } from '@typegoose/typegoose';

class PatreonMonthlyReport
{
    @prop({ required: true })
    public totalMonths!: mongoose.Types.Decimal128;
}

export const MonthlyReport = getModelForClass(PatreonMonthlyReport);
