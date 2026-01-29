setup: ## Configuración completa del proyecto (ejecutar solo la primera vez)
	cd ./backend && docker compose up -d
	cd ./backend && npm install
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < scripts/create_tables.sql
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < scripts/inserts_data.sql
	cd ./backend && node seedPokemons.js
	cd ./backend && docker compose exec -T postgres psql -U postgres -d pokemon < scripts/insert_entrenador_pokemons.sql

run-backend: 
	cd ./backend && npm run dev

start-db:
	cd ./backend && docker compose up -d 

stop-db:
	cd ./backend && docker compose down

delete-db:
	cd ./backend && docker compose down -v