import { Table, Column, Model, DataType, BeforeCreate } from 'sequelize-typescript';
import bcrypt from 'bcrypt';

@Table({
    tableName: 'Room',
})
class Room extends Model<Room> {
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
    roomType!: string;

    
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    roomNo!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    roomPrice!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    roomAmenities!: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    roomAvailability!: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    code!: string;

    }

export {Room}