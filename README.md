Sistema de Inventario para Aserradero "El Pino Dorado"

Este proyecto es una aplicación web que demuestra la manipulación del DOM en JavaScript, creada para un aserradero ficticio llamado "El Pino Dorado". La aplicación permite gestionar un inventario de diferentes tipos de maderas utilizando características clave del DOM y almacenamiento local con IndexedDB.

Funcionalidades

Agregar maderas al inventario:
- Selección de tipo de madera.
- Especificación de cantidad (en metros cúbicos) y precio (por metro cúbico).
- Sistema de calificación con estrellas (1 a 5).
- Cálculo automático del total (cantidad × precio).

Visualización del inventario:
- Mostrar todas las maderas registradas.
- Filtrar por tipo de madera.
- Diseño de tarjetas con información detallada.

Manipulación del DOM:
- Creación dinámica de elementos HTML.
- Gestión de eventos (`click`, `submit`, `change`, etc.).
- Modificación de estilos y clases en tiempo real.
- Sistema de notificaciones temporales con colores y mensajes.

Efectos de sonido:
- Sonido de sierra al eliminar elementos.
- Sonidos de confirmación y error.
- Botón dedicado para reproducir efectos de sonido decorativos.

Almacenamiento local:
- Uso de IndexedDB para guardar persistentemente los datos.
- Operaciones CRUD completas (Crear, Leer, Actualizar, Eliminar).

Tecnologías utilizadas

- HTML
- CSS con variables personalizadas
- JavaScript
- IndexedDB API

Conceptos de DOM demostrados

Selección de elementos:
- `getElementById()`
- `querySelectorAll()`

Creación de elementos:
- `createElement()`
- `appendChild()`
- `innerHTML`

Manipulación de atributos y propiedades:
- `classList.add()`, `classList.remove()`
- `dataset` para atributos personalizados
- Estilos modificados directamente vía `style`

Gestión de eventos:
- `addEventListener()`
- Eventos: `submit`, `click`, `change`, `mouseover`, `mouseout`, `DOMContentLoaded`

IndexedDB para almacenamiento:
- Creación de bases de datos y almacenes de objetos
- Transacciones para operaciones CRUD
- Promesas y asincronía controlada para persistencia

Instrucciones de uso

1. Abre el archivo `index.html` en un navegador web moderno (preferiblemente Chrome o Firefox).
2. Completa el formulario para agregar nuevas maderas al inventario:
   - Selecciona un tipo de madera.
   - Ingresa la cantidad en metros cúbicos.
   - Especifica el precio por metro cúbico.
   - Elige una calificación de calidad (1 a 5 estrellas).
   - Haz clic en "Agregar al Inventario".
3. Filtra el inventario por tipo de madera usando el menú desplegable.
4. Para eliminar una madera individual, haz clic en el botón "X" en la tarjeta correspondiente.
5. Para eliminar todo el inventario, haz clic en el botón "Eliminar Todo".

Estructura del Proyecto

```
aserradero-inventario/
├── index.html         # Interfaz principal del sistema
├── styles.css         # Estilos personalizados y paleta de colores
├── script.js          # Lógica de JavaScript con manipulación del DOM y IndexedDB
├── README.md          # Manual del desarrollador y documentación del proyecto
└── informe.pdf        # Informe visual y técnico para entrega académica
```
