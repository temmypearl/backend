import express from 'express';
const router = express.Router();

import { authRoutes } from './auth.route';

const defaultRoutes = [
{
    path: '/auth',
    route: authRoutes,
},
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;