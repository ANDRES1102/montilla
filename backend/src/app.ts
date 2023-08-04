import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import loginRouter from './routes/login';
import colaboradoresRouter from './routes/colaboradores'
import registrosRouter from './routes/registros'
import mensajesRouter from './routes/mensajes'
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const app: Express = express();
const PORT = 3000;

// Configurar Express para servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Rutas
app.use('/', loginRouter);
app.use('/', colaboradoresRouter);
app.use('/', registrosRouter);
app.use('/', mensajesRouter);

// Servidor escuchando en el puerto 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
