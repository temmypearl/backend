import { Table, Column, Model, DataType, BeforeCreate } from 'sequelize-typescript';

@Table({
    tableName: 'Payment',
    timestamps: true,
})
class Payment extends Model<Payment> {
    // Define columns here, for example:
    // @Column({ type: DataType.STRING })
    // public someField!: string;
}

export {Payment}