# pokemon

# 🎮 Pokémon API - Proyecto Full Stack

API REST con base de datos PostgreSQL que contiene información de los 1,025 Pokémon. 

## 📋 Prerequisitos

- [Docker](https://www.docker.com/get-started) instalado
- [Node.js](https://nodejs.org/) v18 o superior
- [Git](https://git-scm.com/)

---

## 🚀 Instalación

### **1. Clonar el repositorio**

```bash
git clone https://github.com/TU_USUARIO/pokemon. git
cd pokemon/backend


1- docker compose up -d
2- npm install
3- docker compose exec -T postgres psql -U postgres -d pokemon < scripts/create_tables.sql
4- docker compose exec -T postgres psql -U postgres -d pokemon < scripts/inserts_data.sql
5- npm run seed
6- docker compose exec -T postgres psql -U postgres -d pokemon < scripts/insert_entrenador_pokemons.sql

🎯 Uso diario
Una vez instalado, solo necesitas:

bash
# 1. Levantar PostgreSQL (si no está corriendo)
docker compose up -d

# 2. Iniciar el servidor de desarrollo
npm run dev