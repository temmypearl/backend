import express from 'express';
const router = express.Router();

import { authUserRoute } from './auth.route';
import {roomRoutes} from './room.route'

const defaultRoutes = [
{
    path: '/auth/users',
    route: authUserRoute,
},
{
  path:'/hotel',
  route: roomRoutes
}
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;