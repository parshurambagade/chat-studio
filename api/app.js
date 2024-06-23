import express from 'express';
import bodyParser from 'body-parser'
import cors from 'cors'
import mysql from 'mysql'
import jwt from 'jsonwebtoken'
import { Strategy as LocalStrategy } from "passport-local";
import passport from 'passport';
import connection from './db.js';


const app = express();
const PORT = 5000;
connection();
app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());


app.get('/', (req,res) => res.json("hello"));

app.listen(PORT, () => console.log(`Server is running on the port ${PORT}`))