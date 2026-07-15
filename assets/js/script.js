import GestorTareas from "./clases/GestorTareas.js";

const CLAVE_STORAGE = "taskflow-tareas";
const API_URL = "https://jsonplaceholder.typicode.com/todos";
const CONFIG_ESTADOS = [
    { id: "todo", nombre: "POR HACER" },
    { id: "doing", nombre: "HACIENDO" },
    { id: "verifying", nombre: "POR VERIFICAR" },
    { id: "done", nombre: "HECHO" }
];
const NOMBRES_ESTADO = Object.fromEntries(CONFIG_ESTADOS.map(({ id, nombre }) => [id, nombre]));
const NOMBRES_PRIORIDAD = { high: "Alta", medium: "Media", low: "Baja" };

const tablero = document.getElementById("tablero-kanban");
const buscador = document.getElementById("buscador");
const filtroEstado = document.getElementById("filtro-estado");
const filtroPrioridad = document.getElementById("filtro-prioridad");
const formTarea = document.getElementById("form-tarea");
const modalElemento = document.getElementById("modal-tarea");
const modalTitulo = document.getElementById("modal-tarea-titulo");
const inputDescripcion = document.getElementById("descripcion");
const inputFechaLimite = document.getElementById("fecha-limite");
const selectEstado = document.getElementById("estado-tarea");
const selectPrioridad = document.getElementById("prioridad-tarea");
const errorFormulario = document.getElementById("error-formulario");
const btnGuardarTarea = document.getElementById("btn-guardar-tarea");
const buttonLabel = btnGuardarTarea.querySelector(".button-label");
const buttonSpinner = btnGuardarTarea.querySelector(".spinner-border");
const btnCargarApi = document.getElementById("btn-cargar-api");
const porcentajeProgreso = document.getElementById("porcentaje-progreso");
const resumenProgreso = document.getElementById("resumen-progreso");
const barraProgreso = document.getElementById("barra-progreso");
const appToast = document.getElementById("app-toast");
const toastMensaje = document.getElementById("toast-mensaje");
const toastIndicator = document.getElementById("toast-indicator");

const modalTarea = bootstrap.Modal.getOrCreateInstance(modalElemento);
const toast = bootstrap.Toast.getOrCreateInstance(appToast, { delay: 3500 });
let tareaEnEdicionId = null;
let procesandoFormulario = false;
let tareaArrastradaId = null;

const mostrarToast = (mensaje, tipo = "success") => {
    toastMensaje.textContent = mensaje;
    toastIndicator.className = `toast-indicator ${tipo === "danger" ? "error" : tipo}`;
    toast.show();
};

const mostrarErrorFormulario = (mensaje) => {
    errorFormulario.textContent = mensaje;
    errorFormulario.classList.remove("d-none");
    mostrarToast(mensaje, "danger");
};

const recuperarTareas = () => {
    try {
        const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
        return datosGuardados ? JSON.parse(datosGuardados) : [];
    } catch (error) {
        console.error("No fue posible recuperar las tareas:", error);
        mostrarToast("No pudimos leer las tareas guardadas. La aplicación seguirá funcionando.", "warning");
        return [];
    }
};

const gestorTareas = new GestorTareas(recuperarTareas());

const guardarTareas = () => {
    try {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(gestorTareas.obtenerTareas()));
    } catch (error) {
        console.error("No fue posible guardar las tareas:", error);
        mostrarToast("El cambio se realizó, pero no pudo guardarse en este navegador.", "warning");
    }
};

const formateadorFecha = new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
});

const formatearFecha = (fecha) => fecha ? formateadorFecha.format(new Date(fecha)) : "Sin fecha límite";

const convertirAFechaLocal = (fechaIso) => {
    if (!fechaIso) return "";
    const fecha = new Date(fechaIso);
    const compensacion = fecha.getTimezoneOffset() * 60_000;
    return new Date(fecha.getTime() - compensacion).toISOString().slice(0, 16);
};

const obtenerTextoRestante = (tarea) => {
    if (tarea.estado === "done") return "Completada";
    if (!tarea.fechaLimite) return "Sin fecha límite";

    const diferencia = new Date(tarea.fechaLimite).getTime() - Date.now();
    if (diferencia <= 0) return "Tarea vencida";

    const segundosTotales = Math.floor(diferencia / 1000);
    const dias = Math.floor(segundosTotales / 86_400);
    const horas = Math.floor((segundosTotales % 86_400) / 3_600);
    const minutos = Math.floor((segundosTotales % 3_600) / 60);
    const segundos = segundosTotales % 60;
    return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
};

const crearIcono = (clase) => {
    const icono = document.createElement("i");
    icono.className = `bi ${clase}`;
    icono.setAttribute("aria-hidden", "true");
    return icono;
};

const crearBotonAccion = ({ icono, accion, titulo, id, clase = "btn-light", deshabilitado = false }) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = `btn btn-sm ${clase}`;
    boton.dataset.action = accion;
    boton.dataset.id = id;
    boton.title = titulo;
    boton.setAttribute("aria-label", titulo);
    boton.disabled = deshabilitado;
    boton.append(crearIcono(icono));
    return boton;
};

const crearMeta = (icono, texto, clase = "") => {
    const meta = document.createElement("span");
    if (clase) meta.className = clase;
    meta.append(crearIcono(icono), document.createTextNode(texto));
    return meta;
};

const crearTarjeta = (tarea) => {
    const articulo = document.createElement("article");
    articulo.className = "task-card";
    articulo.dataset.id = tarea.id;
    articulo.draggable = true;
    articulo.tabIndex = 0;
    articulo.setAttribute("aria-label", `${tarea.descripcion}, estado ${NOMBRES_ESTADO[tarea.estado]}`);
    articulo.classList.toggle("task-expired", tarea.estaVencida());

    const cabecera = document.createElement("div");
    cabecera.className = "task-card-heading";
    const titulo = document.createElement("h3");
    titulo.className = "task-title";
    titulo.textContent = tarea.descripcion;
    const prioridad = document.createElement("span");
    prioridad.className = `priority-badge priority-${tarea.prioridad}`;
    prioridad.textContent = NOMBRES_PRIORIDAD[tarea.prioridad];
    cabecera.append(titulo, prioridad);

    const estado = document.createElement("span");
    estado.className = "task-status";
    estado.append(crearIcono("bi-circle-fill"), document.createTextNode(NOMBRES_ESTADO[tarea.estado]));

    const metadatos = document.createElement("div");
    metadatos.className = "task-meta";
    metadatos.append(
        crearMeta("bi-calendar-plus", `Creada: ${formatearFecha(tarea.fechaCreacion)}`),
        crearMeta("bi-calendar-event", `Límite: ${formatearFecha(tarea.fechaLimite)}`),
        crearMeta("bi-hourglass-split", obtenerTextoRestante(tarea), "countdown")
    );
    metadatos.lastElementChild.dataset.contadorId = tarea.id;

    const acciones = document.createElement("div");
    acciones.className = "task-card-actions";
    const indiceEstado = CONFIG_ESTADOS.findIndex(({ id }) => id === tarea.estado);
    acciones.append(
        crearBotonAccion({ icono: "bi-arrow-left", accion: "back", titulo: "Retroceder estado", id: tarea.id, deshabilitado: indiceEstado === 0 }),
        crearBotonAccion({ icono: "bi-arrow-right", accion: "forward", titulo: "Avanzar estado", id: tarea.id, deshabilitado: indiceEstado === CONFIG_ESTADOS.length - 1 }),
        crearBotonAccion({ icono: "bi-pencil", accion: "edit", titulo: "Editar tarea", id: tarea.id, clase: "btn-outline-primary" }),
        crearBotonAccion({ icono: "bi-trash", accion: "delete", titulo: "Eliminar tarea", id: tarea.id, clase: "btn-outline-danger" })
    );

    articulo.append(cabecera, estado, metadatos, acciones);
    return articulo;
};

const crearColumna = ({ id, nombre }, tareas) => {
    const columna = document.createElement("section");
    columna.className = "kanban-column";
    columna.dataset.status = id;
    columna.setAttribute("aria-labelledby", `titulo-${id}`);

    const cabecera = document.createElement("header");
    cabecera.className = "kanban-column-header";
    const titulo = document.createElement("h2");
    titulo.id = `titulo-${id}`;
    titulo.className = "column-title";
    const indicador = document.createElement("span");
    indicador.className = "status-indicator";
    indicador.setAttribute("aria-hidden", "true");
    titulo.append(indicador, document.createTextNode(nombre));
    const contador = document.createElement("span");
    contador.className = "column-count";
    contador.textContent = tareas.length;
    contador.setAttribute("aria-label", `${tareas.length} tareas`);
    cabecera.append(titulo, contador);

    const cuerpo = document.createElement("div");
    cuerpo.className = "kanban-column-body";
    if (tareas.length) {
        cuerpo.append(...tareas.map(crearTarjeta));
    } else {
        const vacio = document.createElement("p");
        vacio.className = "empty-column";
        vacio.textContent = "No hay tareas en esta columna";
        cuerpo.append(vacio);
    }

    columna.append(cabecera, cuerpo);
    return columna;
};

const actualizarProgreso = () => {
    const tareas = gestorTareas.obtenerTareas();
    const completadas = tareas.filter(({ estado }) => estado === "done").length;
    const porcentaje = tareas.length ? Math.round((completadas / tareas.length) * 100) : 0;
    porcentajeProgreso.textContent = `${porcentaje}% completado`;
    resumenProgreso.textContent = `${completadas} de ${tareas.length} tareas terminadas`;
    barraProgreso.style.width = `${porcentaje}%`;
    barraProgreso.parentElement.setAttribute("aria-valuenow", porcentaje);
};

const obtenerTareasFiltradas = () => gestorTareas.filtrarTareas({
    termino: buscador.value,
    estado: filtroEstado.value,
    prioridad: filtroPrioridad.value
});

const renderizarTablero = () => {
    const tareasFiltradas = obtenerTareasFiltradas();
    const columnas = CONFIG_ESTADOS.map((configuracion) => {
        const tareasEstado = tareasFiltradas.filter(({ estado }) => estado === configuracion.id);
        return crearColumna(configuracion, tareasEstado);
    });
    tablero.replaceChildren(...columnas);
    actualizarProgreso();
};

const actualizarContadores = () => {
    document.querySelectorAll("[data-contador-id]").forEach((elemento) => {
        const tarea = gestorTareas.obtenerTareaPorId(elemento.dataset.contadorId);
        if (!tarea) return;
        elemento.replaceChildren(crearIcono("bi-hourglass-split"), document.createTextNode(obtenerTextoRestante(tarea)));
        elemento.closest(".task-card")?.classList.toggle("task-expired", tarea.estaVencida());
    });
};

// Solo existe un intervalo global y no vuelve a renderizar el tablero.
setInterval(actualizarContadores, 1000);

const abrirModalNuevaTarea = () => {
    tareaEnEdicionId = null;
    formTarea.reset();
    selectEstado.value = "todo";
    selectPrioridad.value = "medium";
    modalTitulo.textContent = "Nueva tarea";
    buttonLabel.textContent = "Guardar tarea";
    errorFormulario.classList.add("d-none");
};

const abrirModalEdicion = (tarea) => {
    tareaEnEdicionId = tarea.id;
    inputDescripcion.value = tarea.descripcion;
    inputFechaLimite.value = convertirAFechaLocal(tarea.fechaLimite);
    selectEstado.value = tarea.estado;
    selectPrioridad.value = tarea.prioridad;
    modalTitulo.textContent = "Editar tarea";
    buttonLabel.textContent = "Guardar cambios";
    errorFormulario.classList.add("d-none");
    modalTarea.show();
};

const cambiarCargaFormulario = (activo) => {
    procesandoFormulario = activo;
    btnGuardarTarea.disabled = activo;
    buttonSpinner.classList.toggle("d-none", !activo);
};

const obtenerDatosFormulario = () => {
    const { descripcion, fechaLimite, estado, prioridad } = Object.fromEntries(new FormData(formTarea));
    const descripcionLimpia = descripcion.trim();
    if (!descripcionLimpia) throw new Error("Escribe una descripción para la tarea.");

    let fechaIso = null;
    if (fechaLimite) {
        const fecha = new Date(fechaLimite);
        if (Number.isNaN(fecha.getTime())) throw new Error("La fecha límite no es válida.");
        fechaIso = fecha.toISOString();
    }
    return { descripcion: descripcionLimpia, fechaLimite: fechaIso, estado, prioridad };
};

const finalizarCambio = (mensaje) => {
    guardarTareas();
    renderizarTablero();
    mostrarToast(mensaje);
};

formTarea.addEventListener("submit", (event) => {
    event.preventDefault();
    if (procesandoFormulario) return;

    try {
        const datos = obtenerDatosFormulario();
        errorFormulario.classList.add("d-none");

        if (tareaEnEdicionId) {
            gestorTareas.editarTarea(tareaEnEdicionId, datos);
            modalTarea.hide();
            finalizarCambio("Tarea editada correctamente.");
            return;
        }

        cambiarCargaFormulario(true);
        // Simula el proceso de creación y notifica exactamente después de dos segundos.
        setTimeout(() => {
            try {
                gestorTareas.crearTarea(datos.descripcion, datos.fechaLimite, datos);
                modalTarea.hide();
                finalizarCambio("Tarea creada correctamente.");
            } catch (error) {
                mostrarErrorFormulario(error.message);
            } finally {
                cambiarCargaFormulario(false);
            }
        }, 2000);
    } catch (error) {
        mostrarErrorFormulario(error.message);
    }
});

document.addEventListener("click", (event) => {
    if (event.target.closest('[data-action="new-task"]')) abrirModalNuevaTarea();

    const boton = event.target.closest("button[data-action][data-id]");
    if (!boton) return;
    const { action, id } = boton.dataset;

    try {
        if (action === "forward") {
            gestorTareas.avanzarTarea(id);
            finalizarCambio("La tarea avanzó al siguiente estado.");
        } else if (action === "back") {
            gestorTareas.retrocederTarea(id);
            finalizarCambio("La tarea retrocedió al estado anterior.");
        } else if (action === "edit") {
            const tarea = gestorTareas.obtenerTareaPorId(id);
            if (!tarea) throw new Error("No se encontró la tarea que deseas editar.");
            abrirModalEdicion(tarea);
        } else if (action === "delete") {
            gestorTareas.eliminarTarea(id);
            finalizarCambio("Tarea eliminada correctamente.");
        }
    } catch (error) {
        mostrarToast(error.message, "danger");
    }
});

buscador.addEventListener("keyup", renderizarTablero);
filtroEstado.addEventListener("change", renderizarTablero);
filtroPrioridad.addEventListener("change", renderizarTablero);

tablero.addEventListener("mouseover", (event) => {
    event.target.closest(".task-card")?.classList.add("task-card--highlighted");
});

tablero.addEventListener("mouseout", (event) => {
    event.target.closest(".task-card")?.classList.remove("task-card--highlighted");
});

tablero.addEventListener("dragstart", (event) => {
    const tarjeta = event.target.closest(".task-card");
    if (!tarjeta) return;
    tareaArrastradaId = tarjeta.dataset.id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", tareaArrastradaId);
    requestAnimationFrame(() => tarjeta.classList.add("dragging"));
});

tablero.addEventListener("dragover", (event) => {
    const columna = event.target.closest(".kanban-column");
    if (!columna) return;
    event.preventDefault();
    document.querySelectorAll(".kanban-column.drag-over").forEach((elemento) => {
        if (elemento !== columna) elemento.classList.remove("drag-over");
    });
    columna.classList.add("drag-over");
});

tablero.addEventListener("drop", (event) => {
    const columna = event.target.closest(".kanban-column");
    if (!columna) return;
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain") || tareaArrastradaId;
    try {
        const tarea = gestorTareas.obtenerTareaPorId(id);
        if (!tarea) throw new Error("No se encontró la tarea arrastrada.");
        if (tarea.estado !== columna.dataset.status) {
            gestorTareas.cambiarEstado(id, columna.dataset.status);
            finalizarCambio(`Tarea movida a ${NOMBRES_ESTADO[columna.dataset.status]}.`);
        }
    } catch (error) {
        mostrarToast(error.message, "danger");
    } finally {
        tareaArrastradaId = null;
        columna.classList.remove("drag-over");
    }
});

tablero.addEventListener("dragend", () => {
    tareaArrastradaId = null;
    document.querySelectorAll(".dragging, .drag-over").forEach((elemento) => {
        elemento.classList.remove("dragging", "drag-over");
    });
});

const recuperarTareasDesdeApi = async () => {
    try {
        btnCargarApi.disabled = true;
        const response = await fetch(`${API_URL}?_limit=6`);
        if (!response.ok) throw new Error(`La API respondió con el estado ${response.status}.`);
        const datos = await response.json();
        const estadosPendientes = ["todo", "doing", "verifying"];
        const tareasApi = datos.map(({ id, title, completed }) => ({
            id: `api-${id}`,
            descripcion: title,
            estado: completed ? "done" : estadosPendientes[id % estadosPendientes.length],
            prioridad: ["low", "medium", "high"][id % 3],
            fechaCreacion: new Date().toISOString(),
            fechaLimite: null
        }));
        const agregadas = gestorTareas.agregarTareas(...tareasApi);
        finalizarCambio(`${agregadas.length} tarea(s) de ejemplo cargada(s). JSONPlaceholder simula la persistencia.`);
    } catch (error) {
        console.error("Error al recuperar tareas desde la API:", error);
        mostrarToast("La API no está disponible. Tus tareas locales siguen funcionando.", "warning");
    } finally {
        btnCargarApi.disabled = false;
    }
};

btnCargarApi.addEventListener("click", recuperarTareasDesdeApi);

modalElemento.addEventListener("shown.bs.modal", () => inputDescripcion.focus());

guardarTareas(); // Persiste la migración de estados antiguos al cargar.
renderizarTablero();
