{
  "name": "Veicolo",
  "type": "object",
  "properties": {
    "targa": {
      "type": "string",
      "description": "Targa del veicolo"
    },
    "marca": {
      "type": "string",
      "description": "Marca del veicolo"
    },
    "type_vcl": {
      "type": "string",
      "enum": [
        "auto",
        "moto",
        "van",
        "suv"
      ],
      "description": "Tipo di veicolo"
    },
    "alimentazione": {
      "type": "string",
      "enum": [
        "benzina",
        "diesel",
        "elettrica",
        "ibrida",
        "gpl",
        "metano"
      ],
      "description": "Tipo di alimentazione"
    },
    "is_default": {
      "type": "boolean",
      "default": false,
      "description": "Veicolo di default"
    }
  },
  "required": [
    "targa",
    "type_vcl",
    "alimentazione"
  ]
}