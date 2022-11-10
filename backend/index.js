require('dotenv').config();
require("./config/database").connect();
const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT;

const auth = require("./middleware/auth");

const Match = require("./model/match");
const Score = require("./model/score");

const SERV_LOG  = "Test Hello to the backend";

app.use(bodyParser.json());
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	next();
});

app.post("/login", (req, res) => {
	const {
		email,
		password
	} = req.body;

	if (email && email === process.env.ADMIN_EMAIL && password && password === process.env.ADMIN_PASSWORD) {
		const token = jwt.sign({
				email
			},
			process.env.TOKEN_KEY, {
				expiresIn: "2h",
			}
		);
		res.status(200).json(token);
	} else {
		res.status(400).json(false);
	}
});

app.post("/submit", auth, async (req, res) => {
	const {matches} = req.body;
	matches.split("\n").forEach(async match => {
		const [res1, res2] = match.split(', ');
		const score1 = parseInt(res1.substring(res1.lastIndexOf(" ") + 1));
		const score2 = parseInt(res2.substring(res2.lastIndexOf(" ") + 1));
		const team1 = res1.substring(0, res1.lastIndexOf(" "));
		const team2 = res2.substring(0, res2.lastIndexOf(" "));
		// save match
		await Match.create({
			score1,
			score2,
			team1,
			team2,
		});
		// update scores
		const saveOrUpdateScore = async (team, score) => {
			await Score.updateOne({
				team: team
			}, {
				$inc: {
					score: score
				}
			}, {
				upsert: true,
				setDefaultsOnInsert: true
			});
		};
		saveOrUpdateScore(team1, score1 === score2 ? 1 : (score1 > score2 ? 3 : 0));
		saveOrUpdateScore(team2, score1 === score2 ? 1 : (score2 > score1 ? 3 : 0));
	});
	const scores = await Score.find({}).sort({
		'score': -1,
		'team': 1
	});
	res.status(200).send(scores);
});

app.get("/results", auth, async (req, res) => {
	const scores = await Score.find({}).sort({
		'score': -1,
		'team': 1
	});
	res.status(200).send(scores);
});

app.listen(port, () => {
	console.log(SERV_LOG);
});
