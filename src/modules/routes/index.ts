import express from 'express';
const router = express.Router();

import { authUserRoute } from './auth.route';
import {reservationRoutes, roomRoutes} from './room.route'
import path from 'path';

const defaultRoutes = [
{
    path: '/auth/users',
    route: authUserRoute,
},
{
  path:'/hotel',
  route: roomRoutes
},
{
  path:'/reservation',
  route: reservationRoutes
}
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;