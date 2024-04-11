import { NextFunction } from "connect";
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

const reqCounts: Record<string, number> = {};

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
	const ip: string = req.ip!;
	if (!reqCounts[ip]) {
		reqCounts[ip] = 1;
		next();
	} else {
		if (reqCounts[ip] >= 5) {
			return res.status(429).json({ error: "TOO MANY REQUESTS" });
		}
		reqCounts[ip]++;
		next();
	}
};

const textValidator = (req: Request, res: Response, next: NextFunction) => {
	const text: string | undefined = req.body.text;
	if (!text) {
		return res.status(400).json({ error: "BAD REQUEST" });
	}
	console.log(text);
	next();
};

app.post(
	"/messages",
	rateLimiter,
	textValidator,
	(req: Request, res: Response) => {
		res.status(201).json({
			"message": "Message received loud and clear",
		});
	}
);

app.listen(3000, () => {
	console.log("running on port 3000");
});
