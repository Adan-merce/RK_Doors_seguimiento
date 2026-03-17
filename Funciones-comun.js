async function enviarCorreo(rol) {
  const email = document.getElementById('correoInput').value;
  const mensaje = document.getElementById('mensajeEnvio');
  const archivos = [];

  if (!email || !email.includes("@")) {
    mensaje.style.color = "red";
    mensaje.textContent = "Correo inválido";
    return;
  }

  mensaje.style.color = "#FFD700";
  mensaje.textContent = "Enviando...";

  try {
    const query = await db.collection("archivos").where("rol", "==", rol).get();

    if (query.empty) {
      archivos.length = 0;
    } else {
      query.forEach(doc => archivos.push(doc.data()));
    }

    let listaArchivos = "";

    if (archivos.length === 0) {
      listaArchivos = "<p>No hay archivos disponibles.</p>";
    } else {
      listaArchivos = "<ul>";

      archivos.forEach(a => {
        listaArchivos += `
          <li>
            <strong>${a.nombre}</strong><br>
            Tipo: ${a.tipo_archivo}<br>
            Estado: ${a.estado}<br>
            Tamaño: ${a.peso_KB} KB<br>
            <a href="${a.enlace}" target="_blank">Ver archivo</a>
          </li>
        `;
      });

      listaArchivos += "</ul>";
    }

    await emailjs.send(
      "service_b2jkurl",
      "template_fgmopdp",
      {
        to_email: email,
        rol_usuario: rol,
        lista_archivos: listaArchivos,
        fecha_envio: new Date().toLocaleString("es-MX")
      },
      "8EY_xeQKhFDlEPe8Y"
    );

    mensaje.style.color = "#0f0";
    mensaje.textContent = "Correo enviado correctamente";

    document.getElementById('correoInput').value = "";

  } catch (err) {
    mensaje.style.color = "red";
    mensaje.textContent = "Error: " + err.message;
    console.error(err);
  }
}