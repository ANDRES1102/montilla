import { Router, Request, Response } from 'express';
import { createPool } from '../database/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import axios from 'axios'
import dotenv from 'dotenv';
const imageToBase64 = require('image-to-base64');
const formidable = require('formidable');
const path = require('node:path');
const fs = require('node:fs');
const throttle = require('express-throttle-bandwidth');
dotenv.config();

const wh = process.env;

const router = Router();

router.post('/cambiarevento', async (req: Request, res: Response) => {
    const { id, estado} = req.body
    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        update mensajes set estado = ${estado} where id = '${id}'
        `);        
        connection.end();  
        res.json({ message: 'Resultado exitoso', data: {results}, error: false });
        
      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
})

router.post('/getListMensajes', async (req: Request, res: Response) => {
    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        select id, concat(id,'-',titulo) as nombre, estado as estado, create_at as fecha, 1 as eventos from mensajes m 
        order by id desc
        `);        
        connection.end();  
        res.json({ message: 'Resultado exitoso', data: {results}, error: false });
        
      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
})
router.post('/saveMensaje', async (req: Request, res: Response) => {
    const { saludo, despedida, veredas, mensaje, conimagen, titulo } = req.body
    
    try {

        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        select id from mensajes
        `);
        const total = results.length + 1;

        const directorio = path.join(__dirname.replace('routes','public'), 'img'); // Cambia esta ruta por la ubicación de tu directorio
        var nameImagen = "";

        await fs.readdir(directorio, async (err: any, archivos: any) => {
            if (err) {
                nameImagen = ""
            }            
            
            nameImagen = await archivos.find((archivo: any) => archivo.startsWith(total+'.'));
            nameImagen = nameImagen == undefined ? '' : nameImagen
            const mensaje1 = mensaje == null ? '' : mensaje
            await connection.query<RowDataPacket[]>(`
            INSERT INTO mensajes (titulo, mensaje, imagen, saludo, despedida)
            VALUES ('${titulo}', '${mensaje1}', '${nameImagen}', ${saludo}, ${despedida});
            `);  

            const [results3] = await connection.query<RowDataPacket[]>(`
            select id,mensaje,imagen,saludo,despedida from mensajes order by id desc limit 1
            `);

            veredas.forEach(async (element: any) => {                    
                await connection.query<RowDataPacket[]>(`
                    INSERT INTO veredamensaje (idvereda, idmensaje, status)
                    VALUES (${element.id}, '${(results3[0].id+1)}', 'activo');
                `);    
            });

            const [results5] = await connection.query<RowDataPacket[]>(`
            select idvereda as id from veredamensaje where idmensaje = '${(results3[0].id+1)}'
            `);
            results5.forEach(async (element) => {
                const [results6] = await connection.query<RowDataPacket[]>(`
                select celular,nombres from seguidores where idVereda = '${element.id}'
                `);
                results6.forEach(async (element) => {
                    const celular = element.celular
                    const nombres = element.nombres
                    const mensaje2 = results3[0].mensaje
                    const imagen1 = results3[0].imagen
                    const saludo = results3[0].saludo
                    const despedida = results3[0].despedida

                    await connection.query<RowDataPacket[]>(`
                    INSERT INTO mensajeloop (celular, nombres, mensaje, imagen, saludo, despedida, status, idmensaje)
                    VALUES ('${celular}', '${nombres}', '${mensaje2}', '${imagen1}', ${saludo}, ${despedida}, 'Pendiente', '${results3[0].id}');
                    `);

                    const [results7] = await connection.query<RowDataPacket[]>(`
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
                })
            })
        }); 
        res.json({ message: 'registro exitoso', data: {}, error: false });
      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
})

router.post('/deletecacheimage', async (req: Request, res: Response) => {
    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        select id from mensajes
        `);        
        connection.end();  
        const total = results.length + 1;

        const directorio = path.join(__dirname.replace('routes','public'), 'img'); // Cambia esta ruta por la ubicación de tu directorio

        fs.readdir(directorio, (err: any, archivos: any) => {
            if (err) {
                console.error('Error al leer el directorio:', err);
                return;
            }

            const archivosAEliminar = archivos.filter((archivo: any) => archivo.startsWith(total+'.'));

            // Eliminar los archivos encontrados
            archivosAEliminar.forEach((archivo: any) => {
                fs.unlink(path.join(directorio, archivo), (err: any) => {
                if (err) {
                    console.error('Error al eliminar el archivo:', err);
                } else {
                    console.log('Archivo eliminado:', archivo);
                }
                });
            });
        });

      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
})

router.post('/upload', async (req: Request, res: Response) => {
    var total = 0;
    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        select id from mensajes
        `);        
        connection.end();  
        total = results.length;        
      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }

      //------------

    const folder = path.join(__dirname.replace('routes','public'), 'img')
    
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
    }

    const form = new formidable.IncomingForm()
    form.uploadDir = folder
    form.on('fileBegin', async (name: any, file: any) => {
        const newFileName = (total + 1) + path.extname(name);
        file.filepath = path.join(folder, newFileName);
      });
    
    form.parse(req, (_: any, fields: any, files: {}) => {
        console.log('\n-----------')
        console.log('Fields', fields)
        console.log('Received:', Object.keys(files))
        console.log(_)
        res.send('Thank you')
    })
})

export default router;

