# App Task Flow - Gestion de Tareas


Proyecto web sencillo para crear y visualizar tareas desde el navegador. La aplicacion esta construida con HTML, Bootstrap y JavaScript modular, usando clases para representar cada tarea y gestionar la lista de tareas.

## Funcionalidades

- Crear tareas con una descripcion.
- Generar un ID unico para cada tarea con `crypto.randomUUID()`.
- Mostrar las tareas en una tabla.
- Registrar la fecha y hora de creacion con Moment.js.
- Manejar el estado de cada tarea como `Pendiente` o `Finalizada`.
- Incluir metodos para cambiar el estado y eliminar tareas desde la clase gestora.

## Tecnologias usadas

- HTML5
- CSS3
- JavaScript ES Modules
- Bootstrap 5
- Moment.js

## Estructura del proyecto

```text
.
├── index.html
└── assets
    ├── css
    │   └── style.css
    └── js
        ├── script.js
        └── clases
            ├── GestorTareas.js
            └── Tarea.js
```

## Como ejecutar el proyecto

1. Clona o descarga este repositorio.
2. Abre la carpeta del proyecto.
3. Ejecuta el archivo `index.html` en un navegador moderno.

Tambien puedes usar una extension como Live Server en Visual Studio Code para levantar el proyecto en un servidor local.

## Archivos principales

- `index.html`: contiene la estructura principal de la pagina, el formulario de creacion y la tabla de tareas.
- `assets/js/script.js`: conecta la interfaz con la logica de la aplicacion.
- `assets/js/clases/Tarea.js`: define la clase `Tarea` y sus propiedades.
- `assets/js/clases/GestorTareas.js`: define la clase encargada de crear, obtener, actualizar y eliminar tareas.
- `assets/css/style.css`: archivo reservado para estilos personalizados.

## Uso

1. Escribe la descripcion de una tarea en el formulario.
2. Presiona el boton de envio.
3. La tarea se agregara a la tabla con su ID, estado y fecha de creacion.

## Estado actual

El proyecto ya cuenta con la logica base para crear, listar, actualizar y eliminar tareas. Actualmente la interfaz crea y muestra tareas; los botones de cambiar estado y eliminar estan renderizados en la tabla, pero falta conectar sus eventos en `script.js`.

Creado por Ricardo Navarrete.
