"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, 'assets')));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'views'));
const controllerPath = process.env.NODE_ENV !== 'development'
    ? __dirname + '/controllers/*.js'
    : __dirname + '/controllers/*.ts';
(0, routing_controllers_1.useExpressServer)(app, {
    controllers: [controllerPath],
});
const PORT = process.env.PORT || 3003;
ormconfig_1.default.initialize()
    .then(() => {
    console.log("Data Source has been initialized!");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((error) => console.log("Error: ", error));
