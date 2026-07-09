moment.locale("es");  

// Asegúrate de tener moment.js disponible en tu entorno
class Tarea {
    constructor(descripcion) {
        // Genera un ID único (UUID v4) de forma nativa en el navegador
        this.id = crypto.randomUUID(); 
        this.descripcion = descripcion;
        // false = Pendiente, true = Finalizada
        this.estado = false; 
        // Formatea la fecha actual con moment.js
        this.fechaCreacion = moment().format("DD/MM/YYYY h:mm:ss a");
    }
}

export default Tarea;