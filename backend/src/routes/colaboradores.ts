import { Router, Request, Response } from 'express';
import { createPool } from '../database/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import axios from 'axios'
import dotenv from 'dotenv';
dotenv.config();

const wh = process.env;

const router = Router();

router.post('/logout', async (req: Request, res: Response) => {
  const resp: any = await axios.get(wh.url+'/auth/logout') 
  const response = (resp.data);
  res.send(response.data)
})


router.post('/initWhatsapp', async (req: Request, res: Response) => {
  const resp: any = await axios.get(wh.url+'/auth/checkauth') 
  const response = (resp.data);
  if(!response.status){
    const respAuth: any = await axios.get(wh.url+'/auth/getqr') 
    res.send(respAuth.data)
  }else{
    const resp2: any = await axios.get(wh.url+'/auth/dataUser') 
    const response2 = (resp2.data);
    res.send(response2.data)
    console.log(response2.data, 'auth');
  }
})


router.post('/saveRegistroColaboradores', async (req: Request, res: Response) => {
    const {cedula, nombres, celular} = req.body;
    
    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>(`
        INSERT INTO user (cedula, password, role, nombres, status, celular)
        VALUES ('${cedula}', MD5('${cedula}'), 'colaborador', '${nombres}', 'activo', '${celular}')
        ON DUPLICATE KEY UPDATE nombres = '${nombres}', celular = '${celular}'
        `);

        await axios.post(wh.url+'/chat/sendmessage', {phone:'57'+celular, message: '*Plataforma Montilla Alcalde*\nEl colaborador '+nombres+' ha sido creado/actualizado exitosamente.\n\nDatos de Ingreso:\n\n*Usuario:* '+cedula+'\n*Contraseña:* '+cedula}) 
        
        connection.end();  
        res.json({ message: 'Colaborador creado/actualizado exitosamente', data: {}, error: false });
        
      } catch (error) {
        console.log(error)
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
})

router.post('/changeStatus', async (req: Request, res: Response) => {
    const {id, status} = req.body;
    
    try {
      console.log(status);
      
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>("update user set status = '"+status+"' where id = '"+id+"'");
        
        const [cel] = await connection.query<RowDataPacket[]>("select cedula, nombres, celular from user where id = '"+id+"'");
        const nombres = cel[0].nombres
        const celular = cel[0].celular
        await axios.post(wh.url+'/chat/sendmessage', {phone:'57'+celular, message: '*Plataforma Montilla Alcalde*\nHola Señor(@) '+nombres+' su usuario como colaborador ha sido '+ status}) 
        connection.end();  
        res.json({ message: 'El usuario ha sido '+status, data: {}, error: false });
        
      } catch (error) {
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
});

router.post('/restablecerpassword', async (req: Request, res: Response) => {
    const {id, cedula} = req.body;
    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>("update user set password = md5('"+cedula+"') where id = '"+id+"'");
        const [cel] = await connection.query<RowDataPacket[]>("select cedula, nombres, celular from user where id = '"+id+"'");
        const cc = cel[0].cedula
        const nombres = cel[0].nombres
        const celular = cel[0].celular
        connection.end();
        
        await axios.post(wh.url+'/chat/sendmessage', {phone:'57'+celular, message: '*Plataforma Montilla Alcalde*\nContraseña actualizada correctamente, su contraseña es '+cc}) 
        
        res.json({ message: 'Contraseña actualizada correctamente, la contraseña es la misma cédula', data: {}, error: false });
        
      } catch (error) {
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
});

router.post('/listColaboradores', async (req: Request, res: Response) => {
    try {
        const connection = await createPool();
        const [results] = await connection.query<RowDataPacket[]>("select id, cedula, celular, nombres, if(status='activo',1,0) as cambiarestado, 1 as restablecer from user where role != 'admin' order by id desc");
        console.log(results,'colaboradores');        
        connection.end();    
        
        res.json({ message: '', data: {colaboradores:{results}}, error: false });
        
      } catch (error) {
        res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
      }
});

export default router;

