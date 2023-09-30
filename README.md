# 5ta Práctica Integradora - Proceso de Solidificación y Documentación

## LEIBLICH Ezequiel Gaston

## Comisión 43345 - Programación Backend

------------------------------------------------------

# Proceso de Solidificación y Documentación

Este repositorio marca la culminación de un proceso de solidificación y documentación del proyecto en curso. He realizado mejoras significativas en varios aspectos clave de la aplicación.

## Ruta Específica para Usuarios

He movido la ruta suelta /api/users/premium/:uid a un router específico para usuarios en /api/users/, lo que mejora la organización de nuestras rutas y facilita la gestión de usuarios premium.

## Modelo de Usuario Mejorado

He modificado el modelo de usuario para incluir una nueva propiedad llamada "documents", que es un array que contiene objetos con las siguientes propiedades:

 * name: String (Nombre del documento).
 * reference: String (Enlace al documento).
Esta mejora nos permite rastrear y gestionar los documentos asociados a cada usuario.

## Registro de Última Conexión

Agregué una propiedad llamada "last_connection" al usuario. Esta propiedad se actualiza cada vez que el usuario realiza un proceso de inicio de sesión o cierre de sesión, lo que me permite llevar un registro de su actividad más reciente.

## Subida de Documentos

Creé un endpoint en el router de usuarios, /api/users/:uid/documents, con el método POST que permite a los usuarios cargar uno o varios archivos. Utilicé el middleware Multer para recibir y gestionar los documentos cargados. Multer está configurado para guardar los archivos en carpetas diferentes según su tipo:

 * Las imágenes de perfil se almacenan en la carpeta "profiles".
 * Las imágenes de productos se almacenan en la carpeta "products".
 * Los documentos se almacenan en la carpeta "documents".

## Actualización a Usuario Premium

Modifiqué el endpoint /api/users/premium/:uid para que solo actualice a un usuario a la categoría "premium" si ha cargado los siguientes documentos: Identificación, Comprobante de domicilio y Comprobante de estado de cuenta. En caso contrario, se devuelve un error que indica que el usuario debe completar su documentación antes de actualizar su estado a premium.

## Mayor Privilegios para Usuarios Premium

Los usuarios que han sido actualizados a la categoría "premium" ahora tienen mayores privilegios de acceso en comparación con los usuarios normales. Esto les permite disfrutar de características adicionales y un acceso más amplio a la aplicación.

### Instrucciones:

1.  Clona este repositorio en tu máquina local si aún no lo has hecho.

2.  Asegúrate de haber instalado todas las dependencias requeridas mediante el comando npm install.

3.  Ejecuta el servidor de la aplicación.

4.  Explora las rutas documentadas en /api/users para acceder a la funcionalidad mejorada de usuarios y documentos.

¡Gracias por revisar las mejoras en el proyecto! Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en ponerte en contacto conmigo.
