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
// ✅ FUNCIÓN SUBIR ARCHIVOS (Modificada con progreso y mejor manejo de errores)
window.subirArchivos = async function(form, rol) {
  const mensaje = document.getElementById('mensajeSubida');
  // Asumiendo que estos elementos existen en tu HTML para mostrar el progreso:
  // <div id="uploadProgressContainer" style="width: 100%; background-color: #333; border-radius: 4px; margin-top: 10px; height: 10px;">
  //     <div id="progressBar" style="width: 0%; height: 10px; background-color: #FFD700; border-radius: 4px;"></div>
  // </div>
  // <p id="progressText" style="margin-top: 5px; font-size: 0.9em; color: #ccc;"></p>
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  let allFilesUploadedSuccessfully = true; // Bandera para rastrear el éxito general

  const archivos = [
    { input: form.avance_file, tipo: "Avance" },
    { input: form.evidencia_file, tipo: "Evidencia" },
    { input: form.reporte_file, tipo: "Reporte" }
  ];

  mensaje.style.color = "#FFD700"; // Color para "Procesando..."
  mensaje.textContent = "Preparando para subir archivos...";
  if (progressBar) progressBar.style.width = '0%'; // Reiniciar barra de progreso
  if (progressText) progressText.textContent = '';

  let totalBytesUploaded = 0;
  let totalBytesExpected = 0;

  // Primero, calculamos el tamaño total de los archivos que se van a subir
  archivos.forEach(archivoObj => {
    const file = archivoObj.input.files[0];
    if (file) {
      totalBytesExpected += file.size;
    }
  });

  if (totalBytesExpected === 0) {
      mensaje.style.color = "#FFD700";
      mensaje.textContent = "No se seleccionaron archivos para subir.";
      return;
  }

  // Iteramos sobre cada archivo para subirlo
  for (let archivoObj of archivos) {
    const file = archivoObj.input.files[0];
    if (!file) {
      // Si no hay archivo seleccionado para este tipo, simplemente continuamos
      continue;
    }

    try {
      mensaje.style.color = "#FFD700"; // Color para "Subiendo..."
      mensaje.textContent = `Subiendo ${archivoObj.tipo}...`;

      const storageRef = storage.ref().child(`archivos/${rol}/${Date.now()}_${file.name}`);
      const uploadTask = storageRef.put(file);

      // --- INICIO: Manejo de progreso y estado de la subida ---
      uploadTask.on('state_changed',
        (snapshot) => {
          // Progreso de la subida de ESTE archivo
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          totalBytesUploaded += snapshot.bytesTransferred; // Sumamos al total global

          // Calculamos el progreso general de todos los archivos
          const overallProgress = totalBytesExpected > 0 ? (totalBytesUploaded / totalBytesExpected) * 100 : 0;

          if (progressBar) {
            progressBar.style.width = `${overallProgress}%`;
          }
          if (progressText) {
            progressText.textContent = `${Math.round(overallProgress)}% completado (${Math.round(totalBytesUploaded / 1024)}/${Math.round(totalBytesExpected / 1024)} KB)`;
          }
          console.log(`Subiendo ${archivoObj.tipo}: ${Math.round(overallProgress)}%`);
        },
        (err) => {
          // Error durante la subida de ESTE archivo específico
          console.error(`Error al subir ${archivoObj.tipo}:`, err);
          mensaje.style.color = "red";
          // Actualizamos el mensaje general para indicar que hubo un error
          mensaje.textContent = `Error al subir ${archivoObj.tipo}: ${err.message}`;
          allFilesUploadedSuccessfully = false; // Marcamos que al menos un archivo falló
          // No relanzamos 'throw err;' para permitir que los siguientes archivos se intenten subir
        },
        async () => {
          // Archivo subido correctamente
          const url = await uploadTask.getDownloadURL();

          try {
            await db.collection("archivos").add({
              nombre: file.name,
              tipo_archivo: archivoObj.tipo,
              fecha: new Date().toLocaleString("es-MX"),
              estado: "Pendiente",
              enlace: url,
              rol: rol,
              peso_KB: (file.size / 1024).toFixed(2)
            });
            console.log(`Archivo ${archivoObj.tipo} subido y registrado correctamente.`);
          } catch (dbErr) {
            console.error(`Error al registrar ${archivoObj.tipo} en la base de datos:`, dbErr);
            mensaje.style.color = "red";
            mensaje.textContent = `Error al registrar ${archivoObj.tipo} en la base de datos: ${dbErr.message}`;
            allFilesUploadedSuccessfully = false; // Marcamos que hubo un error en la base de datos
          }
        }
      );
      // --- FIN: Manejo de progreso y estado de la subida ---

      // Esperamos a que la subida de ESTE archivo termine antes de continuar con el SIGUIENTE
      // El método put() de Firebase Storage devuelve una promesa que se resuelve cuando la subida termina.
      await uploadTask;

    } catch (err) {
      // Este catch atrapará errores que ocurran ANTES de iniciar la subida (ej. al crear storageRef)
      // o si el await uploadTask falla (aunque los errores de subida se manejan en el on('state_changed'))
      console.error(`Error general al procesar ${archivoObj.tipo}:`, err);
      mensaje.style.color = "red";
      // Actualizamos el mensaje general para indicar que hubo un error
      mensaje.textContent = `Error general al procesar ${archivoObj.tipo}: ${err.message}`;
      allFilesUploadedSuccessfully = false; // Marcamos que al menos un archivo falló
      // No relanzamos 'throw err;' para permitir que los siguientes archivos se intenten subir
    }
  }

  // Actualización final del mensaje basada en la bandera de éxito general
  if (allFilesUploadedSuccessfully) {
    mensaje.style.color = "#0f0"; // Verde para éxito
    mensaje.textContent = "Todos los archivos se subieron correctamente.";
    form.reset(); // Reseteamos el formulario solo si todo fue bien
    if (progressBar) progressBar.style.width = '100%'; // Aseguramos que la barra llegue al 100%
    if (progressText) progressText.textContent = '100% completado';
    // Opcionalmente, podrías querer actualizar la tabla de seguimiento aquí también si cargarDatos está disponible
    // await cargarDatos("Operador");
  } else {
    mensaje.style.color = "red"; // Rojo para indicar errores
    // El mensaje de error específico ya se mostró en el catch o en el callback del error de state_changed.
    // Podríamos añadir un resumen si quisiéramos.
    mensaje.textContent += " Hubo errores al subir algunos archivos. Revisa la consola para más detalles.";
  }
};
