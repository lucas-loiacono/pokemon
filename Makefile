.PHONY: setup run-backend start-db stop-db delete-db clean help start stop

help: ## Mostrar ayuda
	@echo "Comandos disponibles:"
	@echo "  make setup       - Configuración completa del proyecto (primera vez)"
	@echo "  make start       - Iniciar base de datos y servidor"
	@echo "  make run-backend - Iniciar servidor backend"
	@echo "  make start-db    - Iniciar base de datos"
	@echo "  make stop-db     - Detener base de datos"
	@echo "  make stop        - Detener todo"
	@echo "  make delete-db   - Borrar base de datos (contenedor + volumen)"
	@echo "  make clean       - Limpiar TODO (DB + node_modules)"

setup: ## Configuración completa del proyecto (ejecutar solo la primera vez)
	@echo "🚀 Iniciando setup completo..."
	cd ./backend && docker compose up -d
	@echo "⏳ Esperando a que Postgres inicie..."
	sleep 3
	@echo "📦 Instalando dependencias de Node..."
	cd ./backend && npm install
	@echo "🗄️  Creando tablas..."
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < src/database/schemas/create_tables.sql
	@echo "📊 Insertando datos base (tipos, hábitats, zonas)..."
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < src/database/seeds/inserts_data.sql
	@echo "🎮 Cargando 1025 Pokémon desde PokeAPI (~15 min)..."
	cd ./backend && node seedPokemons.js
	@echo "🔄 Cargando evoluciones desde PokeAPI (~2 min)..."
	cd ./backend && node seedEvoluciones.js
	@echo "👤 Insertando entrenadores..."
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < src/database/seeds/insert_entrenador_pokemons.sql
	@echo "✅ Setup completado exitosamente!"
	@echo ""
	@echo "Para iniciar el servidor ejecuta: make start"

start: ## Iniciar base de datos y servidor (USAR DESPUÉS DE REINICIAR PC)
	@echo "🚀 Iniciando base de datos..."
	cd ./backend && docker compose up -d
	@echo "⏳ Esperando a que Postgres inicie..."
	sleep 3
	@echo "🚀 Iniciando servidor backend..."
	cd ./backend && npm run dev

run-backend: ## Iniciar servidor backend en modo desarrollo
	@echo "🚀 Iniciando servidor backend..."
	cd ./backend && npm run dev

start-db: ## Iniciar solo la base de datos
	@echo "🗄️  Iniciando base de datos..."
	cd ./backend && docker compose up -d
	@echo "✅ Base de datos iniciada"

stop-db: ## Detener base de datos
	@echo "🛑 Deteniendo base de datos..."
	cd ./backend && docker compose down
	@echo "✅ Base de datos detenida"

stop: ## Detener todo (base de datos y servidor)
	@echo "🛑 Deteniendo base de datos..."
	cd ./backend && docker compose down
	@echo "✅ Todo detenido"

delete-db: ## Borrar base de datos (contenedor + volumen local)
	@echo "🗑️  Borrando base de datos..."
	cd ./backend && docker compose down
	sudo rm -rf ./backend/volumes/postgres/data
	@echo "✅ Base de datos borrada"

clean: ## Limpiar TODO (contenedor, volumen local, node_modules)
	@echo "🧹 Limpiando proyecto completo..."
	cd ./backend && docker compose down
	sudo rm -rf ./backend/volumes/postgres/data
	rm -rf ./backend/node_modules
	@echo "✅ Proyecto limpio"