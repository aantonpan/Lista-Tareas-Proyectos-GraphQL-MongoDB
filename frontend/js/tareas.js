document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const proyectoIndex = urlParams.get('proyecto');
    const proyectos = JSON.parse(localStorage.getItem('proyectos')) || [];

    // Verifica si el proyecto actual existe
    if (!proyectos[proyectoIndex]) {
        alert("Proyecto no encontrado");
        return;
    }

    // Inicializar el array de tareas si no está definido
    const proyectoActual = proyectos[proyectoIndex];
    if (!proyectoActual.tareas) {
        proyectoActual.tareas = [];  // Inicializa el array de tareas si no existe
    }

    const colPorHacer = document.getElementById('colPorHacer');
    const colEnProceso = document.getElementById('colEnProceso');
    const colFinalizado = document.getElementById('colFinalizado');
    const formTarea = document.getElementById('formTarea');
    const modalTarea = new bootstrap.Modal(document.getElementById('modalTarea'));

    let tareaEditIndex = null;

    // Función para mostrar tareas del proyecto actual
    function renderTareas() {
        // Limpiar las columnas
        colPorHacer.innerHTML = '';
        colEnProceso.innerHTML = '';
        colFinalizado.innerHTML = '';

        // Recorrer cada tarea y colocarla en la columna correcta
        proyectoActual.tareas.forEach((tarea, index) => {
            const tareaHTML = `
                <div class="card mb-2" id="tarea-${index}" draggable="true" ondragstart="drag(event)">
                    <div class="card-body">
                        <h5>${tarea.titulo}</h5>
                        <p>${tarea.descripcion}</p>
                        <p><strong>Responsable:</strong> ${tarea.responsable}</p>
                        <p><strong>Fecha de Finalización:</strong> ${tarea.fechaFinalizacion}</p>
                        <button class="btn btn-secondary" onclick="editarTarea(${index})">Editar</button>
                        <button class="btn btn-danger" onclick="eliminarTarea(${index})">Eliminar</button>
                    </div>
                </div>`;

            // Colocar la tarea en la columna correcta según su estado
            if (tarea.estado === 'Por Hacer') {
                colPorHacer.innerHTML += tareaHTML;
            } else if (tarea.estado === 'En Proceso') {
                colEnProceso.innerHTML += tareaHTML;
            } else if (tarea.estado === 'Finalizado') {
                colFinalizado.innerHTML += tareaHTML;
            }
        });
    }

    // Guardar o editar tarea
    formTarea.addEventListener('submit', function (e) {
        e.preventDefault();

        const tituloTarea = document.getElementById('tituloTarea').value;
        const descripcionTarea = document.getElementById('descripcionTarea').value;
        const estadoTarea = document.getElementById('estadoTarea').value;
        const responsableTarea = document.getElementById('responsableTarea').value;
        const fechaFinalizacion = document.getElementById('fechaFinalizacion').value;

        const nuevaTarea = { titulo: tituloTarea, descripcion: descripcionTarea, estado: estadoTarea, responsable: responsableTarea, fechaFinalizacion: fechaFinalizacion };

        if (tareaEditIndex === null) {
            // Añadir nueva tarea al proyecto actual
            proyectoActual.tareas.push(nuevaTarea);
        } else {
            // Editar tarea existente
            proyectoActual.tareas[tareaEditIndex] = nuevaTarea;
        }

        // Actualizar el proyecto en localStorage
        proyectos[proyectoIndex] = proyectoActual;
        localStorage.setItem('proyectos', JSON.stringify(proyectos));

        // Renderizar tareas nuevamente
        renderTareas();

        // Ocultar el modal y reiniciar el formulario
        modalTarea.hide();
        formTarea.reset();
        tareaEditIndex = null;
    });

    // Función para editar tarea
    window.editarTarea = function (index) {
        const tarea = proyectoActual.tareas[index];
        document.getElementById('tituloTarea').value = tarea.titulo;
        document.getElementById('descripcionTarea').value = tarea.descripcion;
        document.getElementById('estadoTarea').value = tarea.estado;
        document.getElementById('responsableTarea').value = tarea.responsable;
        document.getElementById('fechaFinalizacion').value = tarea.fechaFinalizacion;
        tareaEditIndex = index;
        modalTarea.show();
    };

    // Función para eliminar tarea
    /*window.eliminarTarea = function (index) {
        proyectoActual.tareas.splice(index, 1);
        proyectos[proyectoIndex] = proyectoActual;
        localStorage.setItem('proyectos', JSON.stringify(proyectos));
        renderTareas();
    };*/

    // Función para eliminar tarea usando SweetAlert2
    window.eliminarTarea = function (index) {
        Swal.fire({
            title: '¿Eliminar esta tarea?',
            text: "Esta acción no puede deshacerse.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#007bff', // Color del botón de confirmación (azul)
            cancelButtonColor: '#d33',     // Color del botón de cancelación (rojo)
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Eliminar tarea si el usuario confirma
                proyectoActual.tareas.splice(index, 1);
                proyectos[proyectoIndex] = proyectoActual;
                localStorage.setItem('proyectos', JSON.stringify(proyectos));
                renderTareas(); // Actualizar la vista
                Swal.fire({
                    title: 'Eliminada!',
                    text: 'La tarea ha sido eliminada.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#28a745' // Color del botón "OK" en el popup de éxito (verde)
                });
            }
        });
    };



    // Funciones de Drag and Drop

    function allowDrop(event) {
        event.preventDefault(); // Permitir el drop evitando el comportamiento por defecto
    }

    window.drag = function(event) {
        event.dataTransfer.setData("text", event.target.id); // Guardar el ID del elemento arrastrado
    }
    
    function drop(event) {
        event.preventDefault();
        const idTarea = event.dataTransfer.getData("text");
        const tarea = document.getElementById(idTarea);

        if (!tarea) {
            console.error("Tarea no encontrada:", idTarea);
            return;
        }

        const dropzone = event.target.closest('.task-column');
        if (!dropzone) return;

        if (dropzone !== tarea.parentElement) {
            dropzone.appendChild(tarea); // Mover tarea a la nueva columna
        }

        // Actualizar el estado de la tarea según la columna de destino
        const indexTarea = idTarea.split('-')[1];
        const nuevaColumna = dropzone.id;

        if (nuevaColumna === 'colPorHacer') {
            proyectoActual.tareas[indexTarea].estado = 'Por Hacer';
        } else if (nuevaColumna === 'colEnProceso') {
            proyectoActual.tareas[indexTarea].estado = 'En Proceso';
        } else if (nuevaColumna === 'colFinalizado') {
            proyectoActual.tareas[indexTarea].estado = 'Finalizado';
        }

        // Guardar el nuevo estado en localStorage
        proyectos[proyectoIndex] = proyectoActual;
        localStorage.setItem('proyectos', JSON.stringify(proyectos));
    }

    // Asignar eventos a las columnas
    colPorHacer.ondrop = drop;
    colPorHacer.ondragover = allowDrop;

    colEnProceso.ondrop = drop;
    colEnProceso.ondragover = allowDrop;

    colFinalizado.ondrop = drop;
    colFinalizado.ondragover = allowDrop;

    // Renderizar tareas al cargar la página
    renderTareas();
    document.getElementById('nombreProyecto').innerText = `Tareas del Proyecto: ${proyectoActual.nombre}`;
});
