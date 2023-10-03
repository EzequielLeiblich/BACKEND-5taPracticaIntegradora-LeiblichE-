const socket = io();
const chatTable = document.getElementById('chat-table');
const btnEnviar = document.getElementById('btnEnv');
const messageInput = document.getElementById("message");

socket.on("messages", (messageResult) => {
    if (messageResult !== null) {
        let htmlMessages = "";
        htmlMessages += `
        <thead>
            <tr>
                <th>Usuario</th>
                <th>Mensaje</th>
                <th>Eliminar</th>
            </tr>
        </thead>`;
        messageResult.forEach((message) => {
            htmlMessages += `
            <tbody>
                <tr>
                <td>${message.user}</td>
                <td>${message.message}</td>
                <td><button type="submit" class="btnDeleteSMS boton" id="Eliminar${message._id}">Eliminar</button></td>
                </tr>
            </tbody>`;
        });
        chatTable.innerHTML = htmlMessages;
        messageResult.forEach((message) => {
            const deleteButton = document.getElementById(`Eliminar${message._id}`);
            deleteButton.addEventListener("click", () => {
                deleteMessage(message._id);
            });
        });
    } else {
        let notMessages = "";
        notMessages += `<p style="margin-bottom: 1em;">No hay mensajes disponibles.</p>`;
        chatTable.innerHTML = notMessages;
        return;
    }
})

function deleteMessage(messageId) {
    if (messageId) {
        fetch(`/api/chat/${messageId}`, {
            method: 'DELETE',
            })
        Swal.fire({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            title: `Mensaje eliminado.`,
            icon: 'error'
        });
    }
}
messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        enviarMensaje();
    }
});

btnEnviar.addEventListener("click", () => {
    enviarMensaje();
});

function enviarMensaje() {
    // Obtenemos el firstName del usuario:
    fetch('/api/sessions/current')
    .then((response) => response.json())
    .then((data) => {
        const userName = data.name;
        const messageText = messageInput.value;
        if (messageText.trim() !== "") {
            const message = {
                user: userName,
                message: messageText,
            };
            fetch('/api/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            })
            .then(() => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 5000,
                    title: `Mensaje enviado.`,
                    icon: 'success'
                });
                messageInput.value = "";
            })
            .catch((error) => {
                console.error("Error al enviar el mensaje: " + error.message);
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Mensaje vacío',
                text: 'Por favor, ingresa un mensaje antes de enviarlo.',
            });
        }
    })
    .catch((error) => {
        console.error("Error al obtener el nombre de usuario: " + error.message);
    });
}