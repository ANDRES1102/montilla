import { Router, Request, Response } from 'express';
import { createPool } from '../database/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import axios from 'axios'
import dotenv from 'dotenv';
const imageToBase64 = require('image-to-base64');
var fs = require('fs');
dotenv.config();

const wh = process.env;

const router = Router();

router.post('/getStateWH', async (req: Request, res: Response) => {
  
  const data = {
    phone: '57'+req.body.celular
  }
  const resp: any = await axios.post(wh.url+'/contact/isregistereduser', { data}) 
  const response = (resp.data);
  console.log(response);  
  res.send(response.data)
})

router.post('/getVeredas', async (req: Request, res: Response) => {
    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        select id, nombre from veredas where status = 'activo'
        `);        
        connection.end();  
        res.json({ message: 'Colaborador creado/actualizado exitosamente', data: {results}, error: false });
        
      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
})

router.post('/getSeguidor', async (req: Request, res: Response) => {
    const { cedula } = req.body

    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        select nombres,celular,v.id, v.nombre  
        from seguidores s
        join veredas v on v.id = s.idVereda 
        where cedula = '${cedula}'
        `);        
        connection.end();  
        res.json({ message: 'Resultado exitoso', data: {results}, error: false });
        
      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
})

router.post('/saveSeguidor', async (req: Request, res: Response) => {
    const { cedula, nombres, celular, vereda, colaborador } = req.body

    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        INSERT INTO seguidores (cedula, nombres, celular, idVereda, status, colaborador) VALUES
        ('${cedula}', '${nombres}', '${celular}', '${vereda.id}', 'activo', '${colaborador}')
        ON DUPLICATE KEY UPDATE nombres = '${nombres}', celular = '${celular}', idVereda = '${vereda.id}'
        `);        
        connection.end();  
        axios.post(wh.url+'/chat/sendimage', {phone:'57'+celular, caption: '*Juntos Proyectamos Soluciones*\n\nHola Señor@ '+nombres+'\nAgradezco por creer en mí y en mi plan de gobierno para hacer de Villarrica un Municipio próspero.\n\n Cordialmente,\n\n*Javier Montilla*\nAlcalde de Villarrica\n2024 - 2027 ', image: wh.link + '/img/img.jpeg'}).then(res=>{
          console.log(res);                  
        })
        res.json({ message: 'Seguidor creado/actualizado exitosamente', data: {results}, error: false });
        
      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
})

export default router;

