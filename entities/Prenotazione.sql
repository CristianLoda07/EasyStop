{
  "name": "Prenotazione",
  "type": "object",
  "properties": {
    "veicolo_id": {
      "type": "string",
      "description": "ID del veicolo"
    },
    "parcheggio_id": {
      "type": "string",
      "description": "ID del parcheggio"
    },
    "parcheggio_nome": {
      "type": "string",
      "description": "Nome del parcheggio (denormalizzato)"
    },
    "veicolo_targa": {
      "type": "string",
      "description": "Targa del veicolo (denormalizzato)"
    },
    "inizio_sosta": {
      "type": "string",
      "format": "date-time",
      "description": "Inizio sosta"
    },
    "fine_sosta": {
      "type": "string",
      "format": "date-time",
      "description": "Fine sosta"
    },
    "tipo_posto": {
      "type": "string",
      "enum": [
        "standard",
        "disabili",
        "rosa"
      ],
      "default": "standard",
      "description": "Tipo di posto prenotato"
    },
    "prezzo_tot": {
      "type": "number",
      "description": "Prezzo totale"
    },
    "stato": {
      "type": "string",
      "enum": [
        "confermata",
        "in_corso",
        "completata",
        "cancellata"
      ],
      "default": "confermata",
      "description": "Stato della prenotazione"
    },
    "codice_qr": {
      "type": "string",
      "description": "Codice QR univoco"
    },
    "alimentazione_veicolo": {
      "type": "string",
      "description": "Alimentazione del veicolo usato"
    },
    "risparmio_co2": {
      "type": "number",
      "description": "Risparmio CO2 in grammi"
    }
  },
  "required": [
    "veicolo_id",
    "parcheggio_id",
    "inizio_sosta",
    "fine_sosta"
  ]
}