setup:   ## Configuración completa del proyecto (ejecutar solo la primera vez)
	
	docker compose up -d
	npm install
	docker compose exec -T postgres psql -U postgres -d pokemon < scripts/create_tables.sql
	docker compose exec -T postgres psql -U postgres -d pokemon < scripts/inserts_data.sql
	node seedPokemons.js
	docker compose exec -T postgres psql -U postgres -d pokemon < scripts/insert_entrenador_pokemons.sql
	

run-backend: 
	cd ./backend && npm run dev

start-db:
	cd ./backend && docker compose up -d 