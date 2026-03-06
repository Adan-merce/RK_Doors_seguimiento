// Función para obtener los nombres de archivos subidos
function getFileNames(inputName) {
    const input = document.querySelector(`input[name="${inputName}"]`);
    const files = input.files;
    let fileNames = [];
    if (files) {
        for (let i = 0; i < files.length; i++) {
            fileNames.push(files[i].name);
        }
    }
    return fileNames.length > 0 ? fileNames.join(', ') : 'No subido';
}

// Función para crear el registro de seguimiento
function crearRegistro(usuarioTipo) {
    // Obtener los nombres de los archivos subidos
    const jhaFile = getFileNames('jha_file');
    const procedimientosFile = getFileNames('procedimientos_file');
    const dc3File = getFileNames('dc3_file');
    const permisosFile = getFileNames('permisos_file');
    const eppFile = getFileNames('epp_file');

    // Crear el registro
    const registro = `
        <p><strong>${usuarioTipo}:</strong></p>
        <p><strong>JHA:</strong> ${jhaFile}</p>
        <p><strong>PROCEDIMIENTOS:</strong> ${procedimientosFile}</p>
        <p><strong>DC3 COMPETENCIAS:</strong> ${dc3File}</p>
        <p><strong>PERMISOS DE TRABAJO DIARIOS:</strong> ${permisosFile}</p>
        <p><strong>EPP y herramientas:</strong> ${eppFile}</p>
        <hr>
    `;

    // Agregar al contenedor
    document.getElementById('seguimientoContainer').innerHTML += registro;

    // Guardar en localStorage
    localStorage.setItem('registroSeguimiento', registro);
}

// Evento para crear registro de Operador
document.getElementById('crearRegistroBtn').addEventListener('click', function() {
    crearRegistro('Operador');
});

// Si tienes botones para Supervisor y Director, por ejemplo:
document.getElementById('crearSupervisorBtn').addEventListener('click', function() {
    crearRegistro('Supervisor');
});

document.getElementById('crearDirectorBtn').addEventListener('click', function() {
    crearRegistro('Director');
});
