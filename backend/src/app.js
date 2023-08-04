"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const login_1 = __importDefault(require("./routes/login"));
const colaboradores_1 = __importDefault(require("./routes/colaboradores"));
const registros_1 = __importDefault(require("./routes/registros"));
const mensajes_1 = __importDefault(require("./routes/mensajes"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = 3000;
// Configurar Express para servir archivos estáticos desde la carpeta "public"
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Middlewares
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
// Rutas
app.use('/', login_1.default);
app.use('/', colaboradores_1.default);
app.use('/', registros_1.default);
app.use('/', mensajes_1.default);
// Servidor escuchando en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
