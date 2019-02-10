
# unu_challenge

## Parking Spot Booking Service(s)

## **Project Setup**
Prerequisites:
	

 - Mongo DB
 - Node.js >= 8

## **Install Dependencies**
Execute npm install in the client directory to install dependencies.

 - npm run dev - Starts the micro service in development mode using the micro-dev package.
 - npm start  - Starts the micro service in development mode using the production ready micro package.

## Technologies:
I chose to Node.js for this service using the following modules:
- **micro** - _Asynchronous HTTP microservices_
- **micro-router** - A tiny and functional router for ZEIT's [micro](https://github.com/zeit/micro)
- **dotenv** - 				Zero-dependency module that loads environment variables.
 - **mongodb** - The official [MongoDB](https://www.mongodb.com/) driver for Node.js. Provides a high-level API on top of [mongodb-core](https://www.npmjs.com/package/mongodb-core) that is meant for end users.

## Startup
Note: By default the services can be exposed as one, all running on one port for simplicity. But they can also be deployed individually to support better load balancing.
