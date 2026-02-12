# Pokémon Rancher

Un juego web de gestión y estrategia donde puedes construir tu propio rancho Pokémon, cultivar recursos, capturar especies salvajes y combatir contra entrenadores.

## Características

* **City Builder:** Construye y gestiona **Granjas, Hábitats y Zonas de captura** para tus Pokémon.
* **Sistema de Captura:** Explora diferentes zonas (Pradera, Cueva, Playa...) para encontrar y atrapar Pokémon, cada zona tiene sus propias especies.
* **Granjas:** Cultiva bayas para darles de comer a tus pokemons para subirlos de nivel y evolucionarlos.
* **Hábitats:** Dales un lugar adecuado para vivir y alimentar a tus pokemons.
* **Gestión de Equipo:** Administra tu Caja Pokémon, forma tu equipo de 5.
* **Combate:** Sistema de batalla automatizado 5vs5 basado en niveles y efectividad de tipos.



## Tecnologías

* **Frontend:** HTML, CSS (NES.css), JavaScript
* **Backend:** Node.js, Express.
* **Base de Datos:** PostgreSQL.
* **Infraestructura:** Docker & Docker Compose.

##  Instalación y Configuración

Este proyecto utiliza un **Makefile** para facilitar la configuración inicial. Asegúrate de tener **Docker** y **Node.js** instalados.

## 1. Configuración Inicial (Setup)
Ejecuta este comando **solo la primera vez** para levantar la base de datos, instalar dependencias y llenar las tablas con los datos de Pokémon (esto puede tardar unos minutos):

```bash
make setup
```

### Para correr el proyecto localmente:
```bash
make start
```

## Mas comandos útiles:

### make stop
Descripción: Detiene todos los servicios activos. Baja los contenedores de Docker y apaga la base de datos de forma segura. Úsalo cuando termines de jugar.

### make clean
Descripción: Realiza una limpieza profunda del proyecto. Detiene los servicios, borra la carpeta node_modules y elimina físicamente los volúmenes de datos de la base de datos. Úsalo si necesitas reinstalar todo desde cero (requiere ejecutar make setup después).

### make run-backend
Descripción: Inicia únicamente el servidor de Express (npm run dev) sin intentar levantar Docker. Útil si ya tienes la base de datos corriendo por separado.

### make start-db
Descripción: Levanta únicamente el contenedor de PostgreSQL sin iniciar el servidor del juego. Útil para mantenimiento de base de datos.

### make delete-db
Descripción: Detiene Docker y borra el volumen de datos de PostgreSQL. Esto reinicia tu progreso en el juego pero mantiene las librerías de Node instaladas.

### make stop-db
Descripción: Detiene únicamente el contenedor de la base de datos.