"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const dotenv_1 = __importDefault(require("dotenv"));
const imageToBase64 = require('image-to-base64');
const formidable = require('formidable');
const path = require('node:path');
const fs = require('node:fs');
const throttle = require('express-throttle-bandwidth');
dotenv_1.default.config();
const wh = process.env;
const router = (0, express_1.Router)();
router.post('/cambiarevento', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, estado } = req.body;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        update mensajes set estado = ${estado} where id = '${id}'
        `);
        connection.end();
        res.json({ message: 'Resultado exitoso', data: { results }, error: false });
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/getListMensajes', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        select id, concat(id,'-',titulo) as nombre, estado as estado, create_at as fecha, 1 as eventos from mensajes m 
        order by id desc
        `);
        connection.end();
        res.json({ message: 'Resultado exitoso', data: { results }, error: false });
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/saveMensaje', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { saludo, despedida, veredas, mensaje, conimagen, titulo } = req.body;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        select id from mensajes
        `);
        const total = results.length + 1;
        const directorio = path.join(__dirname.replace('routes', 'public'), 'img'); // Cambia esta ruta por la ubicación de tu directorio
        var nameImagen = "";
        yield fs.readdir(directorio, (err, archivos) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                nameImagen = "";
            }
            nameImagen = yield archivos.find((archivo) => archivo.startsWith(total + '.'));
            nameImagen = nameImagen == undefined ? '' : nameImagen;
            const mensaje1 = mensaje == null ? '' : mensaje;
            yield connection.query(`
            INSERT INTO mensajes (titulo, mensaje, imagen, saludo, despedida)
            VALUES ('${titulo}', '${mensaje1}', '${nameImagen}', ${saludo}, ${despedida});
            `);
            const [results3] = yield connection.query(`
            select id,mensaje,imagen,saludo,despedida from mensajes order by id desc limit 1
            `);
            veredas.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
                yield connection.query(`
                    INSERT INTO veredamensaje (idvereda, idmensaje, status)
                    VALUES (${element.id}, '${(results3[0].id + 1)}', 'activo');
                `);
            }));
            const [results5] = yield connection.query(`
            select idvereda as id from veredamensaje where idmensaje = '${(results3[0].id + 1)}'
            `);
            results5.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
                const [results6] = yield connection.query(`
                select celular,nombres from seguidores where idVereda = '${element.id}'
                `);
                results6.forEach((element) => __awaiter(void 0, void 0, void 0, function* () {
                    const celular = element.celular;
                    const nombres = element.nombres;
                    const mensaje2 = results3[0].mensaje;
                    const imagen1 = results3[0].imagen;
                    const saludo = results3[0].saludo;
                    const despedida = results3[0].despedida;
                    yield connection.query(`
                    INSERT INTO mensajeloop (celular, nombres, mensaje, imagen, saludo, despedida, status, idmensaje)
                    VALUES ('${celular}', '${nombres}', '${mensaje2}', '${imagen1}', ${saludo}, ${despedida}, 'Pendiente', '${results3[0].id}');
                    `);
                    const [results7] = yield connection.query(`
                    SELECT id
                        FROM mensajeloop
                        WHERE celular = '${celular}'
                        AND nombres = '${nombres}'
                        AND mensaje = '${mensaje2}'
                        AND imagen = '${imagen1}'
                        AND saludo = ${saludo}
                        AND despedida = ${despedida}
                        AND status = 'Pendiente';
                    `);
                }));
            }));
        }));
        res.json({ message: 'registro exitoso', data: {}, error: false });
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/deletecacheimage', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        select id from mensajes
        `);
        connection.end();
        const total = results.length + 1;
        const directorio = path.join(__dirname.replace('routes', 'public'), 'img'); // Cambia esta ruta por la ubicación de tu directorio
        fs.readdir(directorio, (err, archivos) => {
            if (err) {
                console.error('Error al leer el directorio:', err);
                return;
            }
            const archivosAEliminar = archivos.filter((archivo) => archivo.startsWith(total + '.'));
            // Eliminar los archivos encontrados
            archivosAEliminar.forEach((archivo) => {
                fs.unlink(path.join(directorio, archivo), (err) => {
                    if (err) {
                        console.error('Error al eliminar el archivo:', err);
                    }
                    else {
                        console.log('Archivo eliminado:', archivo);
                    }
                });
            });
        });
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/upload', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var total = 0;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        select id from mensajes
        `);
        connection.end();
        total = results.length;
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
    //------------
    const folder = path.join(__dirname.replace('routes', 'public'), 'img');
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    const form = new formidable.IncomingForm();
    form.uploadDir = folder;
    form.on('fileBegin', (name, file) => __awaiter(void 0, void 0, void 0, function* () {
        const newFileName = (total + 1) + path.extname(name);
        file.filepath = path.join(folder, newFileName);
    }));
    form.parse(req, (_, fields, files) => {
        console.log('\n-----------');
        console.log('Fields', fields);
        console.log('Received:', Object.keys(files));
        console.log(_);
        res.send('Thank you');
    });
}));
exports.default = router;
