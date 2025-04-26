import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';


const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${environment}` });

const dataSourceOptions: DataSourceOptions = {
    name: 'default',
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: ['src/infrastructure/entities/*{.js,.ts}'],
    migrations: ['src/infrastructure/migrations/*{.js,.ts}'],
    ssl: {
        rejectUnauthorized: false,
    },
};
export default new DataSource(dataSourceOptions);
