{
  "name": "Parcheggio",
  "type": "object",
  "properties": {
    "park_name": {
      "type": "string",
      "description": "Nome del parcheggio"
    },
    "address": {
      "type": "string",
      "description": "Indirizzo"
    },
    "lat": {
      "type": "number",
      "description": "Latitudine"
    },
    "lng": {
      "type": "number",
      "description": "Longitudine"
    },
    "capacita": {
      "type": "number",
      "description": "Posti totali"
    },
    "posti_liberi": {
      "type": "number",
      "description": "Posti attualmente liberi"
    },
    "posti_dis": {
      "type": "boolean",
      "default": false,
      "description": "Posti disabili disponibili"
    },
    "posti_rosa": {
      "type": "boolean",
      "default": false,
      "description": "Posti rosa disponibili"
    },
    "tariffa_oraria": {
      "type": "number",
      "description": "Tariffa oraria in euro"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Parcheggio attivo"
    }
  },
  "required": [
    "park_name",
    "capacita"
  ]
}