// ✅ FUNCIÓN ENVIAR CORREO
window.enviarCorreo = async function(rol) {
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

    query.forEach(doc => archivos.push(doc.data()));

    let listaArchivos = archivos.length === 0
      ? "<p>No hay archivos disponibles.</p>"
      : "<ul>" + archivos.map(a => `
          <li>
            <strong>${a.nombre}</strong><br>
            Tipo: ${a.tipo_archivo}<br>
            Estado: ${a.estado}<br>
            Tamaño: ${a.peso_KB} KB<br>
            <a href="${a.enlace}" target="_blank">Ver archivo</a>
          </li>
        `).join("") + "</ul>";

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
};
// ✅ FUNCIÓN SUBIR ARCHIVOS
window.subirArchivos = async function(form, rol) {
  const mensaje = document.getElementById('mensajeSubida');

  const archivos = [
    { input: form.avance_file, tipo: "Avance" },
    { input: form.evidencia_file, tipo: "Evidencia" },
    { input: form.reporte_file, tipo: "Reporte" }
  ];

  for (let archivoObj of archivos) {
    const file = archivoObj.input.files[0];
    if (!file) continue;

    try {
      mensaje.textContent = `Subiendo ${archivoObj.tipo}...`;

      const storageRef = storage.ref().child(`archivos/${rol}/${Date.now()}_${file.name}`);
      await storageRef.put(file);

      const url = await storageRef.getDownloadURL();

      await db.collection("archivos").add({
        nombre: file.name,
        tipo_archivo: archivoObj.tipo,
        fecha: new Date().toLocaleString("es-MX"),
        estado: "Pendiente",
        enlace: url,
        rol: rol,
        peso_KB: (file.size / 1024).toFixed(2)
      });

    } catch (err) {
      console.error("Error al subir:", err);
      throw err;
    }
  }

  mensaje.style.color = "#0f0";
  mensaje.textContent = "Archivos subidos correctamente";
};
