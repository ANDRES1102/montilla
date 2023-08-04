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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../database/db");
const router = (0, express_1.Router)();
router.post('/changepassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cedula, password, repetir, nueva } = req.body;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query("SELECT id password FROM user WHERE cedula = '" + cedula + "' and password = md5('" + password + "')");
        if (results.length > 0) {
            yield connection.query("update user set password = md5('" + nueva + "') where cedula = '" + cedula + "'");
            connection.end();
            res.json({ message: 'Contraseña Cambiada', data: {}, error: false });
        }
        else {
            res.json({ message: 'No coincide la contraseña actual', data: {}, error: true });
        }
    }
    catch (error) {
        res.json({ message: 'No coincide la contraseña actual', data: {}, error: true });
    }
}));
router.post('/validatepassword', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cedula } = req.body;
    console.log(cedula);
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query("SELECT md5(cedula) as cedula, password FROM user WHERE cedula = '" + cedula + "'");
        connection.end();
        if (results[0].cedula == results[0].password) {
            res.json({ message: 'Cambiar Contraseña', data: {}, error: false });
        }
        else {
            res.json({ message: '', data: {}, error: true });
        }
    }
    catch (error) {
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cedula, password } = req.body;
    try {
        const connection = yield (0, db_1.createPool)();
        const [results] = yield connection.query("SELECT role FROM user WHERE cedula = '" + cedula + "' and password = md5('" + password + "') and status = 'activo'; ");
        console.log("SELECT role FROM user WHERE cedula = '" + cedula + "' and password = md5('" + password + "') and status = 'activo'; ");
        connection.end();
        if (results.length > 0) {
            res.json({ message: 'Inicio de sesión exitoso', data: { role: { results } }, error: false });
        }
        else {
            res.json({ message: 'Usuario y contraseña no existe', data: {}, error: true });
        }
    }
    catch (error) {
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
    }
}));
exports.default = router;
