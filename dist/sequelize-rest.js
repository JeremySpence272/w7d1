"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const express_1 = __importDefault(require("express"));
const sequelize = new sequelize_1.Sequelize({
    dialect: "sqlite",
    storage: "./data/db.db",
});
class Movie extends sequelize_1.Model {
}
Movie.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    yearOfRelease: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    synopsis: {
        type: sequelize_1.DataTypes.STRING,
    },
}, {
    sequelize,
    modelName: "Movie",
    tableName: "Movies",
});
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
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/movies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = Number(req.query.limit) || undefined;
    const offset = Number(req.query.offset) || undefined;
    try {
        const { rows, count } = yield Movie.findAndCountAll({
            limit: limit,
            offset: offset,
        });
        res.status(201).json({ data: rows, count });
    }
    catch (err) {
        const error = err;
        res.status(404).json({ error: error.message });
    }
}));
app.get("/movies/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movieID = req.params.id;
    try {
        const movie = yield Movie.findOne({ where: { id: movieID } });
        res.status(201).json(JSON.stringify(movie));
    }
    catch (err) {
        const error = err;
        res.status(404).json({ error: error.message });
    }
}));
const validateNewMovie = (movie) => {
    return ((movie.title &&
        movie.yearOfRelease &&
        typeof movie.title === "string" &&
        typeof movie.yearOfRelease === "number" &&
        typeof movie.synopsis === "undefined") ||
        typeof movie.synopsis === "string");
};
app.post("/movies/add", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movie = req.body;
    if (!validateNewMovie(movie)) {
        res.status(400).json({ error: "INVALID DATA" });
    }
    try {
        const postedMovie = yield Movie.create({
            title: movie.title,
            yearOfRelease: movie.yearOfRelease,
            synopsis: movie.synopsis || null,
        });
        res.status(200).json({ "created new record": JSON.stringify(postedMovie) });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
}));
app.delete("/movies/delete/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movieID = req.params.id;
    try {
        const destroyed = yield Movie.destroy({ where: { id: movieID } });
        res.status(200).json({ "destroyed post number": destroyed });
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
}));
const filterUpdateObj = (body) => {
    const allowed = [
        "title",
        "yearOfRelease",
        "synopsis",
    ];
    const movie = {};
    allowed.forEach((key) => {
        if (body.hasOwnProperty(key) && body[key] !== undefined)
            movie[key] = body[key];
    });
    return movie;
};
app.put("/movies/update/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movieID = req.params.id;
    const update = filterUpdateObj(req.body);
    try {
        const [affectedCount] = yield Movie.update(update, {
            where: { id: movieID },
        });
        if (affectedCount > 0) {
            res.status(200).send("Updated Post");
        }
        else {
            res.status(404).send("Failed to update");
        }
    }
    catch (err) {
        const error = err;
        res.status(500).json({ error: error.message });
    }
}));
app.listen(3000, () => {
    console.log("running on port 3000");
});
