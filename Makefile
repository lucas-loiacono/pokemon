.PHONY: setup run-backend start-db stop-db delete-db clean help start stop

help: 
	@echo "Comandos disponibles:"
	@echo "  make setup       - Configuración completa del proyecto (primera vez)"
	@echo "  make start       - Iniciar base de datos y servidor"
	@echo "  make run-backend - Iniciar servidor backend"
	@echo "  make start-db    - Iniciar base de datos"
	@echo "  make stop-db     - Detener base de datos"
	@echo "  make stop        - Detener todo"
	@echo "  make delete-db   - Borrar base de datos (contenedor + volumen)"
	@echo "  make clean       - Limpiar TODO (DB + node_modules)"

setup: 
	@echo "Iniciando setup completo..."
	cd ./backend && docker compose up -d
	sleep 3
	cd ./backend && npm install
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < src/database/schemas/create_tables.sql
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < src/database/seeds/inserts_data.sql
	cd ./backend && node seedPokemons.js
	cd ./backend && node seedEvoluciones.js
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < src/database/seeds/insert_entrenador_pokemons.sql
	@echo "Setup completado exitosamente!"
	@echo ""
	@echo "Para iniciar el servidor ejecuta: make start"

start: 
	@echo "Iniciando base de datos..."
	cd ./backend && docker compose up -d
	sleep 3
	cd ./backend && npm run dev

run-backend: 
	@echo "Iniciando servidor backend..."
	cd ./backend && npm run dev

start-db: 
	@echo "Iniciando base de datos..."
	cd ./backend && docker compose up -d
	@echo "Base de datos iniciada"

stop-db:
	@echo "Deteniendo base de datos..."
	cd ./backend && docker compose down
	@echo "Base de datos detenida"

stop: 
	@echo "Deteniendo base de datos..."
	cd ./backend && docker compose down
	@echo "Todo detenido"

delete-db: 
	@echo "Borrando base de datos..."
	cd ./backend && docker compose down
	sudo rm -rf ./backend/volumes/postgres/data
	@echo "Base de datos borrada"

clean: 
	@echo "Limpiando proyecto completo..."
	cd ./backend && docker compose down
	sudo rm -rf ./backend/volumes/postgres/data
	rm -rf ./backend/node_modules
	@echo "Proyecto limpio"