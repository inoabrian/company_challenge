require('dotenv').config();

import * as micro from "micro";
import * as router from "microrouter";
import * as mongo from 'mongodb';
import * as db from "./database";
import { IncomingMessage, ServerResponse } from "http";

// method to query db for any parking spots a user owns or are available
const getAvailableSpots: (connection: mongo.MongoClient, userId: mongo.ObjectID) => Promise<any[]> = async (connection: mongo.MongoClient, userId: mongo.ObjectID): Promise<any[]> => {
    let result: Promise<any[]> = connection.db()
            .collection(process.env.MONGO_COLLECTION)
            .find({owner: userId})
            .toArray();

    return result;
}

const list: router.AugmentedRequestHandler = async (request: router.ServerRequest, response: ServerResponse): Promise<any> => {
    // mongo db connection promise
    let dbConnection: () => Promise<mongo.MongoClient> = db.default;

    let connection: mongo.MongoClient = await dbConnection();

    // get userId from query params
    let userId = request.params.userId ? new mongo.ObjectID(request.params.userId) : null;

    // get available spots that no one owns/reserved/booked
    let availableParkingSpots: any[] = await getAvailableSpots(connection, userId);

    if(availableParkingSpots.length)
        micro.send(response, 200, availableParkingSpots);
    else     
        micro.sendError(request, response, {statusCode: 304, message: 'Could not find any spots'});   
};

const service: micro.RequestHandler = router.router(
    router.get('/list', list),
    router.get('/listUser/:userId', list)
)

export = service;