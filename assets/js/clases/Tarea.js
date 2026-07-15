const ESTADOS = ["todo", "doing", "verifying", "done"];
const PRIORIDADES = ["low", "medium", "high"];

class Tarea {
    constructor(descripcion, fechaLimite = null, datos = {}) {
        const descripcionLimpia = String(descripcion ?? "").trim();
        if (!descripcionLimpia) throw new Error("La descripción no puede estar vacía.");

        this.id = String(datos.id ?? crypto.randomUUID());
        this.descripcion = descripcionLimpia;
        this.estado = Tarea.normalizarEstado(datos.estado);
        this.prioridad = Tarea.normalizarPrioridad(datos.prioridad);
        this.fechaCreacion = Tarea.normalizarFecha(datos.fechaCreacion) ?? new Date().toISOString();
        this.fechaLimite = Tarea.normalizarFecha(fechaLimite ?? datos.fechaLimite);
    }

    static normalizarEstado(estado) {
        // Migra automáticamente el modelo booleano utilizado por versiones anteriores.
        if (estado === true) return "done";
        if (estado === false || estado == null) return "todo";
        return ESTADOS.includes(estado) ? estado : "todo";
    }

    static normalizarPrioridad(prioridad) {
        return PRIORIDADES.includes(prioridad) ? prioridad : "medium";
    }

    static normalizarFecha(fecha) {
        if (!fecha) return null;
        const fechaNormalizada = new Date(fecha);
        if (Number.isNaN(fechaNormalizada.getTime())) throw new Error("La fecha ingresada no es válida.");
        return fechaNormalizada.toISOString();
    }

    static desdeObjeto(datos = {}) {
        return new Tarea(datos.descripcion, datos.fechaLimite, { ...datos });
    }

    cambiarEstado(nuevoEstado) {
        const estadoNormalizado = Tarea.normalizarEstado(nuevoEstado);
        this.estado = estadoNormalizado;
        return this.estado;
    }

    avanzarEstado() {
        const indice = ESTADOS.indexOf(this.estado);
        if (indice < ESTADOS.length - 1) this.estado = ESTADOS[indice + 1];
        return this.estado;
    }

    retrocederEstado() {
        const indice = ESTADOS.indexOf(this.estado);
        if (indice > 0) this.estado = ESTADOS[indice - 1];
        return this.estado;
    }

    editar({
        descripcion = this.descripcion,
        fechaLimite = this.fechaLimite,
        estado = this.estado,
        prioridad = this.prioridad
    } = {}) {
        const descripcionLimpia = String(descripcion).trim();
        if (!descripcionLimpia) throw new Error("La descripción no puede estar vacía.");

        this.descripcion = descripcionLimpia;
        this.fechaLimite = Tarea.normalizarFecha(fechaLimite);
        this.estado = Tarea.normalizarEstado(estado);
        this.prioridad = Tarea.normalizarPrioridad(prioridad);
        return this;
    }

    estaVencida(ahora = new Date()) {
        return Boolean(this.fechaLimite && this.estado !== "done" && new Date(this.fechaLimite) < ahora);
    }
}

export default Tarea;
