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

// method to update our parking spot document and book it
const bookAvailableSpot: (connection: mongo.MongoClient, userId: mongo.ObjectID, spot: ParkingSpot) => Promise<mongo.UpdateWriteOpResult> = async (connection: mongo.MongoClient, userId: mongo.ObjectID, spot: ParkingSpot): Promise<mongo.UpdateWriteOpResult> => {
    return connection.db().collection(process.env.MONGO_COLLECTION)
        .updateOne({_id: spot._id}, {$set:{owner: userId, booked: true}});
}

// method to query db for a parking spot with it's id and makes sure no one book it or booked it
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

// method to update parking spot document to cancel a reservation of a booked spot 
const cancelBooking: (connection: mongo.MongoClient, spotId: mongo.ObjectID) => Promise<mongo.UpdateWriteOpResult> = async (connection: mongo.MongoClient, spotId: mongo.ObjectID): Promise<mongo.UpdateWriteOpResult> => {
    return connection.db().collection(process.env.MONGO_COLLECTION)
        .updateOne({_id: spotId}, {$set:{owner: null, booked: false}});
}

const cancel: router.AugmentedRequestHandler = async (request: router.ServerRequest, response: ServerResponse): Promise<any> => {
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

    if(userAlreadyReservedSpot && userAlreadyReservedSpot._id.equals(spotId)) {
        let canceledReservation: mongo.UpdateWriteOpResult  = await cancelBooking(connection, spotId);

        if(canceledReservation.modifiedCount) {
            micro.send(response, 200);
        } else {
            micro.sendError(request, response, {statusCode: 500, message: 'Could not cancel reserved spot'});       
        }
    } else {
        micro.sendError(request, response, {statusCode: 404, message: 'Could not find reserved spot'});   
    }
}

const book: router.AugmentedRequestHandler = async (request: router.ServerRequest, response: ServerResponse): Promise<any> => {
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
    
    // check if the spot the user is trying to book is available
    let availableSpot: ParkingSpot[] = await getAvailableSpot(connection, spotId);

    // if the spot is not available return an error
    if(availableSpot.length == 0) {
        micro.sendError(request, response, {statusCode: 404, message: 'spot was not found'})
    }

    // attempt to reserve a spot
    let reserved = await bookAvailableSpot(connection, userId, availableSpot[0]);
    
    // if we get a modified count we successfully reserved a spot
    if(reserved.modifiedCount) {
        micro.send(response, 204);
    } else  {
        micro.sendError(request, response, {statusCode: 400, message: 'Could not reserve that spot'});   
    }
};

// const service: micro.RequestHandler = router.router(
//     router.post('/book/:spotId', book),
//     router.post('/book/cancel/:spotId', cancel)
// )

const service: micro.RequestHandler[] = [
    router.post('/book/:spotId', book),
    router.post('/book/cancel/:spotId', cancel)
];

export = service;