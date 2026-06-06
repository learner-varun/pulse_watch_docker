import { z } from "zod/v4";
export declare const settingsTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "settings";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "settings";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        checkIntervalMinutes: import("drizzle-orm/pg-core").PgColumn<{
            name: "check_interval_minutes";
            tableName: "settings";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertSettingsSchema: z.ZodObject<{
    checkIntervalMinutes: z.ZodOptional<z.ZodInt>;
}, {
    out: {};
    in: {};
}>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
//# sourceMappingURL=settings.d.ts.map