// Importar las librerías necesarias
const express = require('express');
const mysql = require('mysql2');
const axios = require('axios')
const url = 'http://localhost:5000'

// Configurar la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'montilla'
});

// Crear una instancia de Express
const app = express();

// Iniciar el servidor en el puerto 3000
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor Express iniciado en el puerto ${PORT}`);
  init();
});

var time = 10000
function init(){
    console.log('Iniciando disparador');
    const sqlQuery = 'select * from vw_getlistmessage g';

    connection.query(sqlQuery, (err, results) => {
        if(err){
            console.log(err);
        }else{
            //se valida si hay cola de espera 0 para descansar el disparador
            if(results.length == 0){
                time = 180000
            }else{
                time = 8000
            }

            try {
                //validamos tipo de mensaje
                if(results[0].modo == 'mensaje'){
                    mensaje(results[0])
                }else{
                    media(results[0])
                }                
            } catch (error) {
                time = 180000
                console.log('Sin cola de mensajes, esperando...');
            }

            //se relanza el disparador
            setTimeout(() => {
                init();
            }, time);
        }
  });
}

function mensaje(data){
    const celular = data.celular
    const mensaje = data.mensaje
    const idPM = data.idPM
    const idMI = data.idMI

    axios.post(url+'/chat/sendmessage', {
        phone:celular, 
        message: mensaje
    }).then(res=>{
        console.log(res.data);
        finalizar(idPM, idMI)
    }).catch(res =>{
        console.log(res);
    })
}

function media(data){
    const celular = data.celular
    const mensaje = data.mensaje
    const imagen = data.imagen
    const idPM = data.idPM
    const idMI = data.idMI

    axios.post(url+'/chat/sendimage', {
        phone:celular, 
        caption: mensaje,
        image: 'http://localhost:3000/img/'+imagen
    }).then(res=>{
        console.log(res.data);
        finalizar(idPM, idMI)
    }).catch(res =>{
        console.log(res);
    })
}

function finalizar(idPM, idMI){
    //finalizamos el mensaje individual
    const sqlQuery = `update mensajeloop set status = 'Finalizado' where id = '${idMI}'`;

    connection.query(sqlQuery, (err, results) => {
        if(err){
            console.log(err);
        }else{
        }
    });

    //consultamos si hay 0 mensajes de idPM
    const sqlQuery2 = `select id from mensajeloop m where idmensaje = '${idPM}' and status = 'Pendiente'`;

    connection.query(sqlQuery2, (err, results) => {
        if(err){
            console.log(err);
        }else{
            console.log(results);
            if(results.length <= 1){
                const sqlQuery2 = `update mensajes set estado = '4' where id = '${idPM}'`;
                connection.query(sqlQuery2, (err, results) => {
                    if(err){
                        console.log(err);
                    }else{
                        console.log('publicacion de mensajes finalizado');
                    }
                })
            }
        }
    });
}