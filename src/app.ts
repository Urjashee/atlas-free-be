import 'reflect-metadata';
import {useExpressServer} from "routing-controllers";
import AppDataSource from "../ormconfig";
import dotenv from 'dotenv';
import express from "express";
import path from "path";

dotenv.config();

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const controllerPath =
    process.env.NODE_ENV !== 'development'
        ? __dirname + '/controllers/*.js'
        : __dirname + '/controllers/*.ts';

useExpressServer(app, {
    controllers: [controllerPath],
});

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => console.log("Error: ", error));
