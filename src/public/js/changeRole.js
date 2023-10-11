const carga = document.getElementById("VistaDeCarga");
const vista = document.getElementById("contenedorVista");

function pantallaCarga() {
    setTimeout(() => {
        carga.style = "display: none";
        vista.style = "display: block";
    }, 1500);
};
pantallaCarga();

const form = document.getElementById('uploadDocuments');

async function cargaChageRole() {
    const response = await fetch('/api/sessions/getDocsUser', {
        method: 'GET',
    })
    const res = await response.json();
    if (res.docs.length > 0) {
        for (let i = 0; i < res.docs.length; i++) {
            const documento = res.docs[i];
            const nombreArchivo = extractFileNameWithUID(documento.reference);
            if (documento.name === "Identificación") {
                let spanArchivo = document.getElementById('nombreArchivo1');
                spanArchivo.textContent = nombreArchivo;
            } else if (documento.name === "Comprobante de domicilio") {
                let spanArchivo = document.getElementById('nombreArchivo2');
                spanArchivo.textContent = nombreArchivo;
            } else if (documento.name === "Comprobante de estado de cuenta") {
                let spanArchivo = document.getElementById('nombreArchivo3');
                spanArchivo.textContent = nombreArchivo;
            }
        }
    }
}
cargaChageRole();

function extractFileNameWithUID(url) {
    const match = url.match(/[-\w]+\s*-\s*(.+)/);
    if (match) {
        const nombreArchivo = match[1];
        return nombreArchivo;
    }
    return url;
}

const cargarDocs = document.getElementById('cargarDocs');
cargarDocs.addEventListener("click", (event) => {
    event.preventDefault();
    cargarDocuments();
});

async function cargarDocuments() {
    const sessionResponse = await fetch('/api/sessions/current', {
        method: 'GET',
    });
    const sessionRes = await sessionResponse.json();
    const uid = sessionRes.userId;
    if (uid) {
        try {
            const formDocs = new FormData(form);
            const uploadDocsRes = await fetch(`/api/users/${uid}/documents`, {
                method: 'POST',
                body: formDocs
            });
            const docsRes = await uploadDocsRes.json();
            const statusCodeDocsRes = docsRes.statusCode;
            const messageRes = docsRes.message;
            const customError = docsRes.message;
            if (statusCodeDocsRes === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Cargar documentación',
                    text: messageRes || 'Documentación actualizada exitosamente.',
                });
                setTimeout(() => {
                    cargaChageRole();
                }, 2000);
            } else if (statusCodeDocsRes === 206) {
                Swal.fire({
                    icon: 'info',
                    title: 'Cargar documentación',
                    text: messageRes || 'Documentación actualizada exitosamente.',
                });
                setTimeout(() => {
                    cargaChageRole();
                }, 2000);
            } else if (customError) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar cargar documentación',
                    text: customError || 'Hubo un problema al intentar cargar la documentación.',
                });
            } else if (statusCodeDocsRes === 404) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Error al intentar cargar documentación',
                    text: messageRes || 'Hubo un problema al intentar cargar la documentación.',
                });
            } else if (statusCodeDocsRes === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al intentar cargar documentación',
                    text: messageRes || 'Hubo un problema al intentar cargar la documentación.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: "Error en la solicitud de cargar documentos",
                text: 'Error: ' + error.message
            });
        }
    }
}

const ChangeROLE = document.getElementById('ChangeROLE');
ChangeROLE.addEventListener("click", async (event) => {
    event.preventDefault();
    const sessionResponse = await fetch('/api/sessions/current', {
        method: 'GET',
    });
    const sessionRes = await sessionResponse.json();
    const uid = sessionRes.userId;
    const role = sessionRes.role;
    if (role === "user") {
        const confirmationResult = await Swal.fire({
            title: 'Confirmar cambio de role',
            text: '¿Deseas actualizar a "Premium"? Los usuarios premium pueden publicar, editar y eliminar productos, aunque el administrador puede eliminar contenido que incumpla nuestras políticas. ¿Confirmas el cambio?',
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        });
        if (confirmationResult.isConfirmed) {
            cambiarRole(uid);
        }
    }
    if (role === "premium") {
        const confirmationResult = await Swal.fire({
            title: 'Confirmar cambio de role',
            text: '¿Estás seguro de que deseas cambiar a role "User"? Ten en cuenta que si realizas este cambio, todos los productos que hayas publicado como usuario premium serán eliminados automáticamente de la plataforma. ¿Confirmas esta modificación?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar',
        });
        if (confirmationResult.isConfirmed) {
            cambiarRole(uid);
        }
    }
});

async function cambiarRole(uid) {
    try {
        const response = await fetch(`/api/users/premium/${uid}`, {
            method: 'POST',
        });
        const res = await response.json();
        const statusCode = res.statusCode;
        const message = res.message;
        const customError = res.cause;
        if (statusCode === 200) {
            Swal.fire({
                icon: 'success',
                title: 'Actualizar role',
                text: message || 'Role actualizado exitosamente.',
            });
        } else if (customError) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar actualizar role',
                text: customError || 'Hubo un problema al intentar actualizar role del user.',
            });
        } else if (statusCode === 404 || statusCode === 422) {
            Swal.fire({
                icon: 'warning',
                title: 'Error al intentar actualizar role',
                text: message || 'Hubo un problema al intentar actualizar role del user.',
            });
        } else if (statusCode === 500) {
            Swal.fire({
                icon: 'error',
                title: 'Error al intentar actualizar role',
                text: message || 'Hubo un problema al intentar actualizar role del user.',
            });
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error en la solicitud de actualizar role',
            text: 'Error: ' + error.message
        });
    };

};