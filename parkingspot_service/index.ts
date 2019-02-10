require('dotenv').config();

import * as micro from "micro";
import * as router from "microrouter";
import * as mongo from 'mongodb';
import * as db from "./database";
import { IncomingMessage, ServerResponse } from "http";

const list: router.AugmentedRequestHandler = async (request: router.ServerRequest, response: ServerResponse): Promise<any> => {
    let dbConnection: () => Promise<mongo.MongoClient> = db.default;

    let connection: mongo.MongoClient = await dbConnection();

    let userId = request.params.userId ? new mongo.ObjectID(request.params.userId) : null;

    let result: mongo.Cursor = connection.db()
            .collection(process.env.MONGO_COLLECTION)
            .find({owner: userId});

    if(result)
        micro.send(response, 200, await result.toArray());
    else     
        micro.sendError(request, response, {statusCode: 304, message: 'Could not find any spots'});   
};

const service: micro.RequestHandler = router.router(
    router.get('/list', list),
    router.get('/listUser/:userId', list)
)

export = service;