### feat: normalizar la estructura de datos

He actualizado la estructura de datos de la carta para que mantenga la estructura que nuestro modelo de base de datos para así cuando se desarrolle la base de datos se realice facilmente el cambio, tambien he modificado los estilos de la interfaz para mantenerla igual al commit anterior adaptando el código.

**Cambios principales:**

* **Estructura de Datos:** Se ha adaptado `menuData` al modelo relacional de la base de datos. Los alérgenos ahora son independientes y se vinculan a los platos por ID, dejando el sistema listo para la conexión con el backend.
* **Visualización de la Carta**: La visualización se ha dejado como se encontraba en el último commit.