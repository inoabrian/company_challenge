require('dotenv').config();

import * as micro from "micro";
import * as router from "microrouter";

import * as parking_service from "./parkingspot_service/index";
import * as reserve_service from "./reserve_service/index";
import * as booking_service from "./booking_service/index";

const service: micro.RequestHandler = router.router(
    ...reserve_service,
    ...parking_service,
    ...booking_service
);

micro.default(service)
    .listen(process.env.PORT, () => {
        console.log(`service listening ${process.env.PORT}`);
    });
