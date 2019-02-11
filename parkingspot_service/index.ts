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
    let connection: mongo.MongoClient;

    try {
        connection = await dbConnection();
    }
    catch(ex){
        console.error(ex);
    }

    // get userId from query params
    let userId = request.params.userId ? new mongo.ObjectID(request.params.userId) : null;

    // get available spots that no one owns/reserved/booked
    let availableParkingSpots: any[] = await getAvailableSpots(connection, userId);

    micro.send(response, 200, availableParkingSpots);
};

const create: router.AugmentedRequestHandler = async(request: router.ServerRequest, response: router.ServerResponse): Promise<any> => {
    // mongo db connection promise
    let dbConnection: () => Promise<mongo.MongoClient> = db.default;

    let connection: mongo.MongoClient;

    try {
        connection = await dbConnection();
    }
    catch(ex){
        console.error(ex);
        micro.send(response, 500);
    }

    let created: mongo.InsertWriteOpResult = await connection.db()
        .collection(process.env.MONGO_COLLECTION)
        .insertMany(
            [
                {"lat": 40.8135923, "lon": -74.2177845, "zone": "1A", "street": "S. Fullterton Avenue", "owner": null},
                {"lat": 40.813540, "lon":  -74.217724, "zone": "1A", "street": "S. Fullterton Avenue", "owner": null},
                {"lat": 40.813333, "lon": -74.217798, "zone": "1A", "street": "S. Fullterton Avenue", "owner": null},
                {"lat": 40.812939, "lon": -74.217891, "zone": "1A", "street": "S. Fullterton Avenue", "owner": null}
            ]
        );

    micro.send(response, 200, created);
};

const service: micro.RequestHandler[] = [ 
    router.get('/list', list),
    router.get('/listUser/:userId', list),
    router.post('/seed_list', create)
];

export = service;