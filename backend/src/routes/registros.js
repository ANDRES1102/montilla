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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const imageToBase64 = require('image-to-base64');
var fs = require('fs');
dotenv_1.default.config();
const wh = process.env;
const router = (0, express_1.Router)();
router.post('/getStateWH', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = {
        phone: '57' + req.body.celular
    };
    const resp = yield axios_1.default.post(wh.url + '/contact/isregistereduser', { data });
    const response = (resp.data);
    console.log(response);
    res.send(response.data);
}));
router.post('/getVeredas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        select id, nombre from veredas where status = 'activo'
        `);
        connection.end();
        res.json({ message: 'Colaborador creado/actualizado exitosamente', data: { results }, error: false });
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/getSeguidor', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cedula } = req.body;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        select nombres,celular,v.id, v.nombre  
        from seguidores s
        join veredas v on v.id = s.idVereda 
        where cedula = '${cedula}'
        `);
        connection.end();
        res.json({ message: 'Resultado exitoso', data: { results }, error: false });
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/saveSeguidor', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cedula, nombres, celular, vereda, colaborador } = req.body;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        INSERT INTO seguidores (cedula, nombres, celular, idVereda, status, colaborador) VALUES
        ('${cedula}', '${nombres}', '${celular}', '${vereda.id}', 'activo', '${colaborador}')
        ON DUPLICATE KEY UPDATE nombres = '${nombres}', celular = '${celular}', idVereda = '${vereda.id}'
        `);
        connection.end();
        axios_1.default.post(wh.url + '/chat/sendimage', { phone: '57' + celular, caption: '*Juntos Proyectamos Soluciones*\n\nHola Señor@ ' + nombres + '\nAgradezco por creer en mí y en mi plan de gobierno para hacer de Villarrica un Municipio próspero.\n\n Cordialmente,\n\n*Javier Montilla*\nAlcalde de Villarrica\n2024 - 2027 ', image: wh.link + '/img/img.jpeg' }).then(res => {
            console.log(res);
        });
        res.json({ message: 'Seguidor creado/actualizado exitosamente', data: { results }, error: false });
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
exports.default = router;
