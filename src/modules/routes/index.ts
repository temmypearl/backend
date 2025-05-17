import express from 'express';
const router = express.Router();

import { hotelRoute } from './auth.route';

const defaultRoutes = [
{
    path: '/UI',
    route: hotelRoute,
},
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;