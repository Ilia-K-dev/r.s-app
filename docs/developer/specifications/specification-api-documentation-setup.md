---
title: API Documentation Generation Setup
created: [YYYY-MM-DD - Original Creation Date]
last_updated: 2025-05-06
update_history:
  - 2025-05-06: Added standardized metadata header.
status: Partial
owner: [Primary Maintainer]
related_files: []
---

# API Documentation Generation Setup

## Table of Contents

* [Completed Steps](#completed-steps)
* [Remaining Work](#remaining-work)

### Completed Steps
- Created `server/src/config/swagger.js`.
- Updated `server/src/app.js` to include Swagger middleware.

### Remaining Work
- Install Swagger/OpenAPI dependencies.
- Generate interactive API documentation.
- Create Postman collection.

```javascript
// Install Swagger dependencies
cd server
npm install swagger-jsdoc swagger-ui-express swagger-autogen
```

```javascript
// Create Swagger configuration
Create: /server/src/config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Receipt Scanner API',
    version: '1.0.0',
    description: 'API documentation for Receipt Scanner application',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.receiptscannerapp.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
```

```javascript
// Update app.js to include Swagger
// File: server/src/app.js
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// Add before other routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

// **PAUSE**: Ask human to navigate to http://localhost:5000/api-docs
