
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

## Local Startup
**Note:** 
   <br/>By default the services can be exposed as one, all running on one port for simplicity. 
   <br/>But they can also be deployed individually to support better load balancing.
   <br/>
   <br/>Running the application locally is done by executing the following
   - **npm install** - will install project dependencies and dump/seed or local database
   - **npm run dev** - will start the service at our environments port (3000) by default
   
## Local Docker Startup
**Note:**
   <br/>**npm install** - will install project dependencies **does not seed our docker mongo db**
   <br/>**npm run docker-debug** - will build and run our docker containers for our app and mongo db
   <br/>**TO SEED DATA IN OUR MONGO DB DOCKER CONTAINER I ADDED A /seed_list POST REQUEST HANDLER**
   
	```
	curl -X POST \
	http://localhost:3000/seed_list \
	-H 'Content-Type: application/json' \
	-H 'Postman-Token: bbeda0a5-cbcf-44b1-bb95-87cdfd5d67cd' \
	-H 'cache-control: no-cache'
	```	
   
   
## Example HTTP Requests
**List**<br/>
- list all available parking spots<br/>
	```
	curl -X GET \
	http://localhost:3000/list \
	-H 'Postman-Token: 4b2537d0-bc83-489e-8c72-131b96c722b2' \
	-H 'cache-control: no-cache'
	```
- list parking spots reserved/booked by user<br/>
	```
	curl -X GET \
	http://localhost:3000/listUser/5c6063681500a360b1d0cad8 \
	-H 'Postman-Token: 4b2537d0-bc83-489e-8c72-131b96c722b2' \
	-H 'cache-control: no-cache'
	```
**Booking**
- book a parking spot<br/>
	```
	curl -X POST \
	http://localhost:3000/book/5c60e9f2e0b52affe409ba6c \
	-H 'Content-Type: application/json' \
	-H 'Postman-Token: 6b9ecaef-1722-47bb-81cf-8f54fd9c218c' \
	-H 'cache-control: no-cache' \
	-d '{
	"userId": "5c6063681500a360b1d0cad8"
	}'
	```
- release a parking spot booking<br/>
	```
	curl -X POST \
	http://localhost:3000/unbook/5c60e9f2e0b52affe409ba6c \
	-H 'Content-Type: application/json' \
	-H 'Postman-Token: 070be9a1-2743-4e17-9f12-504f1d939789' \
	-H 'cache-control: no-cache' \
	-d '{
		"userId": "5c6063681500a360b1d0cad8"
	}'
	```
**Reserve**
- reserve a parking spot<br/>
	```
	curl -X POST \
	http://localhost:3000/reserve/5c60e9f2e0b52affe409ba6c \
	-H 'Content-Type: application/json' \
	-H 'Postman-Token: 6b9ecaef-1722-47bb-81cf-8f54fd9c218c' \
	-H 'cache-control: no-cache' \
	-d '{
	"userId": "5c6063681500a360b1d0cad8"
	}'
	```
- release a reservation<br/>
	```
	curl -X POST \
	http://localhost:3000/unreserve/5c60e9f2e0b52affe409ba6c \
	-H 'Content-Type: application/json' \
	-H 'Postman-Token: 070be9a1-2743-4e17-9f12-504f1d939789' \
	-H 'cache-control: no-cache' \
	-d '{
		"userId": "5c6063681500a360b1d0cad8"
	}'
	```
