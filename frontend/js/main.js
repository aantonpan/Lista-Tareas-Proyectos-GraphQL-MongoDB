document.addEventListener('DOMContentLoaded', function () {
    const proyectosContainer = document.getElementById('proyectosContainer');
    const formProyecto = document.getElementById('formProyecto');
    const modalProyecto = new bootstrap.Modal(document.getElementById('modalProyecto'));
    const crearProyectoBtn = document.getElementById('crearProyectoBtn'); // Agregamos el botón
    let proyectos = JSON.parse(localStorage.getItem('proyectos')) || [];
    let proyectoEditIndex = null;

    // Event listener para abrir el modal de nuevo proyecto
    crearProyectoBtn.addEventListener('click', function () {
        // Reiniciar formulario y abrir el modal
        formProyecto.reset();
        proyectoEditIndex = null; // Reiniciar el índice de edición
        modalProyecto.show();
    });

    // Función para mostrar proyectos
    function renderProyectos() {
        proyectosContainer.innerHTML = ''; // Limpiar contenedor de proyectos
        proyectos.forEach((proyecto, index) => {
            const proyectoHTML = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${proyecto.nombre}</h5>
                            <p class="card-text">${proyecto.descripcion}</p>
                            <button class="btn btn-secondary" onclick="editarProyecto(${index})">Editar</button>
                            <button class="btn btn-danger" onclick="eliminarProyecto(${index})">Eliminar</button>
                            <a href="../pages/tareas.html?proyecto=${index}" class="btn btn-primary">Ver Tareas</a>
                        </div>
                    </div>
                </div>`;
            proyectosContainer.innerHTML += proyectoHTML;
        });
    }

    // Guardar o editar proyecto
    formProyecto.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevenir comportamiento por defecto del formulario

        const nombreProyecto = document.getElementById('nombreProyecto').value;
        const descripcionProyecto = document.getElementById('descripcionProyecto').value;

        const nuevoProyecto = { nombre: nombreProyecto, descripcion: descripcionProyecto, tareas: [] };

        if (proyectoEditIndex === null) {
            // Añadir un nuevo proyecto
            proyectos.push(nuevoProyecto);
        } else {
            // Editar proyecto existente
            proyectos[proyectoEditIndex] = nuevoProyecto;
        }

        // Guardar proyectos en localStorage
        localStorage.setItem('proyectos', JSON.stringify(proyectos));

        // Renderizar proyectos de nuevo
        renderProyectos();

        // Ocultar modal y reiniciar formulario
        modalProyecto.hide();
        formProyecto.reset();

        // Reiniciar índice de edición
        proyectoEditIndex = null;
    });

    // Función para editar proyecto
    window.editarProyecto = function (index) {
        const proyecto = proyectos[index];
        document.getElementById('nombreProyecto').value = proyecto.nombre;
        document.getElementById('descripcionProyecto').value = proyecto.descripcion;
        proyectoEditIndex = index;
        modalProyecto.show();
    };

    // Función para eliminar proyecto usando SweetAlert2
    window.eliminarProyecto = function (index) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#007bff', // Botón de confirmación (azul)
            cancelButtonColor: '#d33',     // Botón de cancelación (rojo)
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Eliminar el proyecto si el usuario confirma
                proyectos.splice(index, 1);
                localStorage.setItem('proyectos', JSON.stringify(proyectos));
                renderProyectos(); // Volver a renderizar

                // Popup de confirmación de eliminación exitosa
                Swal.fire({
                    title: 'Eliminado!',
                    text: 'El proyecto ha sido eliminado.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745' // Color del botón "OK" en el popup de éxito (verde)
                });
            }
        });
    };

    // Mostrar los proyectos al cargar la página
    renderProyectos();
});
