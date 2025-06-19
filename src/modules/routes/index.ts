import express from 'express';
const router = express.Router();

import { authUserRoute } from './auth.route';
import {reservationRoutes, roomRoutes, paymentRoutes} from './room.route'
import { adminRouter } from './admin.route';

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
},
{
  path:'/payment',
  route: paymentRoutes
},
{
  path:'/admin',
  route: adminRouter
}
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;