import { Sequelize, DataTypes, Model } from "sequelize";
import express, { Request, Response } from "express";

const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: "./data/db.db",
});

class Movie extends Model {
	public id!: number;
	public title!: string;
	public yearOfRelease!: number;
	public synopsis!: string;
}

Movie.init(
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		title: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		yearOfRelease: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		synopsis: {
			type: DataTypes.STRING,
		},
	},
	{
		sequelize,
		modelName: "Movie",
		tableName: "Movies",
	}
);

sequelize.sync();

// Movie.create({
// 	title: "The Grand Escape",
// 	yearOfRelease: 2022,
// 	synopsis:
// 		"An adventurous tale of courage and friendship, set against the backdrop of a daring prison escape.",
// }).then((movie) => console.log(movie.toJSON()));

// Movie.create({
// 	title: "Whispers in the Dark",
// 	yearOfRelease: 2018,
// 	synopsis:
// 		"A suspenseful thriller that explores the depths of human psyche and the secrets that bind us together.",
// }).then((movie) => console.log(movie.toJSON()));

// Movie.create({
// 	title: "Beyond the Horizon",
// 	yearOfRelease: 2020,
// 	synopsis:
// 		"An epic journey of discovery and survival in the vast expanses of space.",
// }).then((movie) => console.log(movie.toJSON()));

////////////////////////////////////////////////

const app = express();
app.use(express.json());

app.get("/movies", async (req: Request, res: Response) => {
	const limit = Number(req.query.limit) || undefined;
	const offset = Number(req.query.offset) || undefined;
	try {
		const { rows, count } = await Movie.findAndCountAll({
			limit: limit,
			offset: offset,
		});
		res.status(201).json({ data: rows, count });
	} catch (err) {
		const error = err as Error;
		res.status(404).json({ error: error.message });
	}
});

app.get("/movies/:id", async (req: Request, res: Response) => {
	const movieID = req.params.id;
	try {
		const movie = await Movie.findOne({ where: { id: movieID } });
		res.status(201).json(JSON.stringify(movie));
	} catch (err) {
		const error = err as Error;
		res.status(404).json({ error: error.message });
	}
});

interface MovieInterface {
	title?: string;
	yearOfRelease?: number;
	synopsis?: string;
}

const validateNewMovie = (movie: MovieInterface): boolean => {
	return (
		(movie.title &&
			movie.yearOfRelease &&
			typeof movie.title === "string" &&
			typeof movie.yearOfRelease === "number" &&
			typeof movie.synopsis === "undefined") ||
		typeof movie.synopsis === "string"
	);
};

app.post("/movies/add", async (req: Request, res: Response) => {
	const movie: MovieInterface = req.body;
	if (!validateNewMovie(movie)) {
		res.status(400).json({ error: "INVALID DATA" });
	}

	try {
		const postedMovie: Movie = await Movie.create({
			title: movie.title,
			yearOfRelease: movie.yearOfRelease,
			synopsis: movie.synopsis || null,
		});
		res.status(200).json({ "created new record": JSON.stringify(postedMovie) });
	} catch (err) {
		const error = err as Error;
		res.status(500).json({ error: error.message });
	}
});

app.delete("/movies/delete/:id", async (req: Request, res: Response) => {
	const movieID = req.params.id;
	try {
		const destroyed = await Movie.destroy({ where: { id: movieID } });
		res.status(200).json({ "destroyed post number": destroyed });
	} catch (err) {
		const error = err as Error;
		res.status(500).json({ error: error.message });
	}
});

const filterUpdateObj = (body: any): MovieInterface => {
	const allowed: (keyof MovieInterface)[] = [
		"title",
		"yearOfRelease",
		"synopsis",
	];
	const movie: MovieInterface = {};
	allowed.forEach((key) => {
		if (body.hasOwnProperty(key) && body[key] !== undefined)
			movie[key] = body[key];
	});

	return movie;
};

app.put("/movies/update/:id", async (req: Request, res: Response) => {
	const movieID = req.params.id;
	const update: MovieInterface = filterUpdateObj(req.body);
	try {
		const [affectedCount] = await Movie.update(update, {
			where: { id: movieID },
		});
		if (affectedCount > 0) {
			res.status(200).send("Updated Post");
		} else {
			res.status(404).send("Failed to update");
		}
	} catch (err) {
		const error = err as Error;
		res.status(500).json({ error: error.message });
	}
});

app.listen(3000, () => {
	console.log("running on port 3000");
});
