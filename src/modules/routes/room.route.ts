import { userController } from "../users/user.controller";


import express from "express";
import { validateData } from "./../../middlewares/validation";
import {roomController}  from "./../room/room.controller";

const roomRoutes = express.Router();
roomRoutes.get("/getRooms", roomController.getRooms);

export default roomRoutes