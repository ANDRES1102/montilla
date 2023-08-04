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
dotenv_1.default.config();
const wh = process.env;
const router = (0, express_1.Router)();
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield axios_1.default.get(wh.url + '/auth/logout');
    const response = (resp.data);
    res.send(response.data);
}));
router.post('/initWhatsapp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield axios_1.default.get(wh.url + '/auth/checkauth');
    const response = (resp.data);
    if (!response.status) {
        const respAuth = yield axios_1.default.get(wh.url + '/auth/getqr');
        res.send(respAuth.data);
    }
    else {
        const resp2 = yield axios_1.default.get(wh.url + '/auth/dataUser');
        const response2 = (resp2.data);
        res.send(response2.data);
        console.log(response2.data, 'auth');
    }
}));
router.post('/saveRegistroColaboradores', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cedula, nombres, celular } = req.body;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query(`
        INSERT INTO user (cedula, password, role, nombres, status, celular)
        VALUES ('${cedula}', MD5('${cedula}'), 'colaborador', '${nombres}', 'activo', '${celular}')
        ON DUPLICATE KEY UPDATE nombres = '${nombres}', celular = '${celular}'
        `);
        yield axios_1.default.post(wh.url + '/chat/sendmessage', { phone: '57' + celular, message: '*Plataforma Montilla Alcalde*\nEl colaborador ' + nombres + ' ha sido creado/actualizado exitosamente.\n\nDatos de Ingreso:\n\n*Usuario:* ' + cedula + '\n*Contraseña:* ' + cedula });
        connection.end();
        res.json({ message: 'Colaborador creado/actualizado exitosamente', data: {}, error: false });
    }
    catch (error) {
        console.log(error);
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/changeStatus', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, status } = req.body;
    try {
        console.log(status);
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query("update user set status = '" + status + "' where id = '" + id + "'");
        const [cel] = yield connection.query("select cedula, nombres, celular from user where id = '" + id + "'");
        const nombres = cel[0].nombres;
        const celular = cel[0].celular;
        yield axios_1.default.post(wh.url + '/chat/sendmessage', { phone: '57' + celular, message: '*Plataforma Montilla Alcalde*\nHola Señor(@) ' + nombres + ' su usuario como colaborador ha sido ' + status });
        connection.end();
        res.json({ message: 'El usuario ha sido ' + status, data: {}, error: false });
    }
    catch (error) {
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/restablecerpassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, cedula } = req.body;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query("update user set password = md5('" + cedula + "') where id = '" + id + "'");
        const [cel] = yield connection.query("select cedula, nombres, celular from user where id = '" + id + "'");
        const cc = cel[0].cedula;
        const nombres = cel[0].nombres;
        const celular = cel[0].celular;
        connection.end();
        yield axios_1.default.post(wh.url + '/chat/sendmessage', { phone: '57' + celular, message: '*Plataforma Montilla Alcalde*\nContraseña actualizada correctamente, su contraseña es ' + cc });
        res.json({ message: 'Contraseña actualizada correctamente, la contraseña es la misma cédula', data: {}, error: false });
    }
    catch (error) {
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/listColaboradores', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query("select id, cedula, celular, nombres, if(status='activo',1,0) as cambiarestado, 1 as restablecer from user where role != 'admin' order by id desc");
        console.log(results, 'colaboradores');
        connection.end();
        res.json({ message: '', data: { colaboradores: { results } }, error: false });
    }
    catch (error) {
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
exports.default = router;
