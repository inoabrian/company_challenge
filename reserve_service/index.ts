require('dotenv').config();

import * as micro from "micro";
import * as router from "microrouter";
import * as mongo from 'mongodb';
import * as db from "./database";
import { IncomingMessage, ServerResponse } from "http";
import { connect } from "net";

interface ParkingSpot {
    _id: mongo.ObjectID,
    lat: number,
    lon: number,
    zone: string,
    street: string,
    owner: mongo.ObjectID | null,
    reserveTime: Date
}

// method to update our parking spot document and reserve it
const reserveAvailableSpot: (connection: mongo.MongoClient, userId: mongo.ObjectID, spot: ParkingSpot) => Promise<mongo.UpdateWriteOpResult> = async (connection: mongo.MongoClient, userId: mongo.ObjectID, spot: ParkingSpot): Promise<mongo.UpdateWriteOpResult> => {
    return connection.db().collection(process.env.MONGO_COLLECTION)
        .updateOne({_id: spot._id}, {$set:{owner: userId, reserveTime: new Date()}});
}

// method to query db for a parking spot with it's id and makes sure no one reserved it or booked it
const getAvailableSpot: (connection: mongo.MongoClient, id: mongo.ObjectID|null) => Promise<ParkingSpot[]> = async (connection: mongo.MongoClient, id: mongo.ObjectID|null): Promise<ParkingSpot[]> => {
    return connection.db()
        .collection(process.env.MONGO_COLLECTION)
        .find({_id: id, owner: null})
        .toArray();
}

// method to query db to check if user already reserved or booked a spot
const alreadyReservedSpot: (connection: mongo.MongoClient, userId: mongo.ObjectID) => Promise<ParkingSpot> = async (connection: mongo.MongoClient, userId: mongo.ObjectID): Promise<ParkingSpot> => {
    return connection.db()
        .collection(process.env.MONGO_COLLECTION)
        .findOne({owner: userId});
}

const reserve: router.AugmentedRequestHandler = async (request: router.ServerRequest, response: ServerResponse): Promise<any> => {
    // mongo db connection promise
    let dbConnection: () => Promise<mongo.MongoClient> = db.default;

    let connection: mongo.MongoClient = await dbConnection();
    
    const body = await micro.json(request);

    // get the users id from the request payload
    let userId: mongo.ObjectID = new mongo.ObjectID(body["userId"]);

    // get the spotId from the query params
    let spotId: mongo.ObjectID | null = request.params.spotId ? new mongo.ObjectID(request.params.spotId) : null;

    // first we should check if the user already has a spot reserved
    let userAlreadyReservedSpot = await alreadyReservedSpot(connection, userId);

    if(userAlreadyReservedSpot)
        micro.sendError(request, response, {statusCode: 400, message: 'user already has a spot reserved'});
    
    // check if the spot the user is trying to reserve is available
    let availableSpot: ParkingSpot[] = await getAvailableSpot(connection, spotId);

    // if the spot is not available return an error
    if(availableSpot.length == 0) {
        micro.sendError(request, response, {statusCode: 404, message: 'spot was not found'})
    }

    // attempt to reserve a spot
    let reserved = await reserveAvailableSpot(connection, userId, availableSpot[0]);
    
    // if we get a modified count we successfully reserved a spot
    if(reserved.modifiedCount) {
        micro.send(response, 204);
    } else  {
        micro.sendError(request, response, {statusCode: 400, message: 'Could not reserve that spot'});   
    }
};

const service: micro.RequestHandler = router.router(
    router.post('/reserve/:spotId', reserve)
)

export = service;