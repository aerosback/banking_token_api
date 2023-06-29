# Título del Proyecto

API REST Banking Token Demo Project


### Pre-requisitos 📋

- nvm
- Node 12.19.0
- docker
- docker-compose

### Instalación 🔧

- Situarnos en la Carpeta Raiz
- Si queremos ver e interactuar con stdout / stderr del contenedor via una terminal adjunta:

```bash
docker-compose up
```

- De otra forma (detached):

```bash
docker-compose up -d
```

### Test Unitarios y de Integracion 🔧
- Situarnos en la Carpeta Raiz
- Ejecutar: 

```bash
docker-compose run app npm test
```

## Ejecutando pruebas con API Rest externamente ⚙️

- La app cuenta con los siguientes endpoints (por defecto el puerto http seria el 8080):

- Crear Token: [POST] /api/tokens/create/user-create
- Obtener Info del Token: [POST] /api/tokens/info

- Se añadio un archivo POSTMAN para hacer las invocaciones de prueba.

## Autor ✒️
* **Alexander Nuñez**
