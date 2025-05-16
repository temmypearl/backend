import { Table, Column, Model, DataType, BeforeCreate } from 'sequelize-typescript';
import bcrypt from 'bcrypt';

@Table({
    tableName: 'Reservation',
    timestamps: true,
})
class Reservation extends Model<Reservation> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        })
        id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    phoneNumber!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
        isEmail: true,
        },
    })
    emailAddress!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    checkInDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    checkOutDate!: Date;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    noOfChildren!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    noOfAdult!: number;
     
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    specialRequest!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    code!: string;

    }

export { Reservation}