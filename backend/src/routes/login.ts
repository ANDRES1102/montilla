import { Router, Request, Response } from 'express';
import { createPool } from '../database/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const router = Router();

router.post('/changepassword', async (req: Request, res: Response) => {
  const { cedula, password, repetir, nueva } = req.body;
  
  try {
    const connection = await createPool();
    const [results] = await connection.query<RowDataPacket[]>("SELECT id password FROM user WHERE cedula = '"+cedula+"' and password = md5('"+password+"')");
    
    if (results.length > 0) {
      await connection.query<RowDataPacket[]>("update user set password = md5('"+nueva+"') where cedula = '"+cedula+"'");
      connection.end();
      res.json({ message: 'Contraseña Cambiada', data: {}, error: false });
    } else {
        res.json({ message: 'No coincide la contraseña actual', data: {}, error: true });
    }
  } catch (error) {
    res.json({ message: 'No coincide la contraseña actual', data: {}, error: true });
  }  
});

router.post('/validatepassword', async (req: Request, res: Response) => {
  const { cedula } = req.body;
  console.log(cedula);
  
  try {
    const connection = await createPool();
    const [results] = await connection.query<RowDataPacket[]>("SELECT md5(cedula) as cedula, password FROM user WHERE cedula = '"+cedula+"'");
    
    connection.end();
    
    if (results[0].cedula == results[0].password) {
        res.json({ message: 'Cambiar Contraseña', data: {}, error: false });
    } else {
        res.json({ message: '', data: {}, error: true });
    }
  } catch (error) {
    res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
  }  
});

router.post('/login', async (req: Request, res: Response) => {
  const { cedula, password } = req.body;
  
  try {
    const connection = await createPool();
    const [results] = await connection.query<RowDataPacket[]>("SELECT role FROM user WHERE cedula = '"+cedula+"' and password = md5('"+password+"') and status = 'activo'; ");
    console.log("SELECT role FROM user WHERE cedula = '"+cedula+"' and password = md5('"+password+"') and status = 'activo'; ")
    connection.end();
    
    if (results.length > 0) {
        res.json({ message: 'Inicio de sesión exitoso', data: {role:{results}}, error: false });
    } else {
        res.json({ message: 'Usuario y contraseña no existe', data: {}, error: true });
    }
  } catch (error) {
    res.json({ message: 'Error al consultar la base de datos', data: {}, error: true });
  }
  
});

export default router;

