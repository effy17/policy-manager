import { Model, DataTypes } from "sequelize";
import { sequelize } from "../utils/db";
export interface Source { name: string; email: string; }
export interface Destination { name: string; address: string; }
export class Rule extends Model {
    public id!: number;
    public tenantId!: number;
    public ruleIndex!: number;
    public name!: string;
    public action!: "Allow" | "Block";
    public sources!: Source[];
    public destinations!: Destination[];
}
Rule.init(
    {
        id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        tenantId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
        ruleIndex: { type: DataTypes.DECIMAL(10,6), allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        action: { type: DataTypes.ENUM("Allow","Block"), allowNull: false },
        sources: { type: DataTypes.JSON, allowNull: false },
        destinations: { type: DataTypes.JSON, allowNull: false }
    },
    { sequelize, tableName: "rules", modelName: "Rule",timestamps: false, }
);