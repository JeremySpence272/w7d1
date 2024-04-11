"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const reqCounts = {};
const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    if (!reqCounts[ip]) {
        reqCounts[ip] = 1;
        next();
    }
    else {
        if (reqCounts[ip] >= 5) {
            return res.status(429).json({ error: "TOO MANY REQUESTS" });
        }
        reqCounts[ip]++;
        next();
    }
};
const textValidator = (req, res, next) => {
    const text = req.body.text;
    if (!text) {
        return res.status(400).json({ error: "BAD REQUEST" });
    }
    console.log(text);
    next();
};
app.post("/messages", rateLimiter, textValidator, (req, res) => {
    res.status(201).json({
        "message": "Message received loud and clear",
    });
});
app.listen(3000, () => {
    console.log("running on port 3000");
});
