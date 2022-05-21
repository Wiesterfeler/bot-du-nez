const fs = require('fs');
const events = require('events');
const schedule = require('node-schedule');
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const tools = require('./functions.js');
const readline = require('readline');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
	console.log(tools.generateDate() + "Ready\n");
});

client.login(token);

let data = fs.readFileSync('branleurs.json');
let guilds = JSON.parse(data);
let guild = undefined;
let branlos = undefined;
let date;
let reverseHours;
let reverseMinutes;
let userGettingPoint = undefined;
let lastMinutesWon = new Date().getMinutes();
let notCorrectHourMessages = [
	"IL EST PAS L'HEURE ABRUTI",
	"TROU DE BALLE DE MERDE J'Y CROIS PAS COMMENT T'ES CON C'EST PAS L'HEURE",
	"ROH MAIS MERDE COMMENT C'EST POSSIBLE D'ÊTRE UN GROS DÉBILE COMME ÇA REGARDE L'HEURE",
	"BIENVENU A MONGOLO CITY, TU VIENS D'ÊTRE ELU MAIRE DES FILS DE PUTE QUI SAVENT PAS LIRE L'HEURE",
	"BOUH TU SAIS PAS LIRE L'HEURE, TU SERAIS PAS UN TURBO CON ?",
	"OH MAIS J'Y CROIS PAS QUEL CONNARD, IL SAIT PAS LIRE L'HEURE",
	"RAS LE CUL DES DES FILS DE PUTE COMME TOI QUI SAVENT PAS LIRE L'HEURE"
];
let alreadyWonMessages = [
	"Bah non fallait être plus vif hein",
	"Toi aussi fallait aller plus vite",
	"Arrêtez d'insister quelqu'un d'autre à déjà gagné en fait",
	"Oh vous saoulez de ouf niquez vos mères",
	"NON PUTAIN C'EST PERDU TA MERE",
	"Allez j'abandonne zetes trop con je ferrai plus d'effort"
];
let alreadyWonMessagesIndex = 0;
let replyMsg = "";
let randomHourPoints = tools.getRandomInt(24);
let randomHourRandomPlayer = tools.getRandomInt(24);
let ptsWon = 1;
let wordToBeFound = tools.setWord(readline, fs, events);

const jobRandomHours = schedule.scheduleJob('0 0 0 * * *', function() {
	randomHourPoints = tools.getRandomInt(24);
	randomHourRandomPlayer = tools.getRandomInt(24);
	console.log(tools.generateDate() + "Random numbers reset");
	wordToBeFound = tools.setWord(readline, fs, events);
	guilds = JSON.parse(fs.readFileSync('branleurs.json'));
	guilds.forEach(guild => {
		guild.wordFound = false;
	});
	fs.writeFileSync('branleurs.json', JSON.stringify(guilds, null, 4));
});

const jobResetScores = schedule.scheduleJob('0 0 0 * * 1', function() {
	fs.writeFileSync('branleurs_last_week.json', JSON.stringify(guilds, null, 4));
	fs.writeFileSync('branleurs.json', "[]");
	guilds = JSON.parse(fs.readFileSync('branleurs.json'));
	console.log(tools.generateDate() + "Scores cleared");
});

client.on('messageCreate', message => {
	if(message.author.bot) return;

	date = new Date();
	reverseHours = date.getHours().toString().split("").reverse().join("");
	reverseMinutes = date.getMinutes().toString().split("").reverse().join("");

	userGettingPoint = null;
	replyMsg = "";
	messageContent = message.content.toUpperCase();

	guild = guilds.find(guild => guild.id === message.guild.id);
	
	if (guild === undefined){
		guild = {id: message.guild.id, branleurs: [], alreadyWon: false, alreadyWonMessagesIndex: 0, lastMinutesWon: (date.getHours() - 1), wordFound: false};
		console.log("guild :" + guild.name + " created");
		guilds.push(guild);
		fs.writeFileSync('branleurs.json', JSON.stringify(guilds, null, 4));
		console.log(tools.generateDate() + "Guilds serialized");
	}

	if(messageContent === "NEZ RESULTATS") {
		message.reply(tools.sortBranleurs(JSON.parse(fs.readFileSync('branleurs_last_week.json')), guild));
		return;
	}

	if(messageContent === "NEZ CLASSEMENT") {
		message.reply(tools.sortBranleurs(guilds, guild));
		return;
	}

	if(messageContent === "MATTHIEU EST RENTRÉ" || messageContent === "MATTBIEURT EST RENTRÉ" || (messageContent === "JE SUIS RENTRÉ" && message.author.id == 303274212091625472)) {
		message.reply("MATTHIEU EST DE RETOUR OUIII");
		return;
	}

	if(messageContent === "MATTHIEU N'EST PAS ENCORE REVENU MAIS REVIENT DIMANCHE" || (messageContent === "JE SUIS PAS ENCORE REVENU MAIS JE REVIENS DIMANCHE" && message.author.id == 303274212091625472) || (messageContent === "JE NE SUIS PAS ENCORE REVENU MAIS JE REVIENS DIMANCHE" && message.author.id == 303274212091625472)) {
		message.reply("YOUHOU MATTHIEU N'EST PAS ENCORE REVENU MAIS IL REVIENT DIMANCHE YOUPII");
		return;
	}

	if(messageContent === "MATTHIEU C'EST DIMANCHE TU ES CENSÉ ÊTRE REVENU") {
		message.reply("Il abuse j'ai pas raison la miff ?");
		return;
	}

	if(messageContent.includes(wordToBeFound)) {
		if(guild.wordFound === false) {
			branlos = tools.findBranlos(message, guild);
			guild.wordFound = true;
			branlos.pts = branlos.pts + 5;
			replyMsg += "Bravo " + branlos.name + " ! Tu as été le.a premier.e à trouver le mot secret \"" + wordToBeFound + "\", tu as " + branlos.pts + " point(s)";
			
			newData = JSON.stringify(guilds, null, 4);
			fs.writeFileSync('branleurs.json', newData);
		} else {
			replyMsg += "Désolé ! Le mot \"" + wordToBeFound + "\" a déjà été trouvé...";
		}

		message.reply(replyMsg);
	}

	if(messageContent.includes("NEZ") || messageContent.includes("NOSE")) {
		if(date.getHours() === date.getMinutes() || date.getHours() == reverseMinutes || date.getMinutes() == reverseHours) {
			if(date.getMinutes() !== guild.lastMinuteWon) {
				guild.alreadyWon = false;
				guild.alreadyWonMessagesIndex = 0;
			}

			if(!guild.alreadyWon) {
				branlos = undefined;

				if(date.getHours() == randomHourRandomPlayer && guild.branleurs.length > 0) {
					branlos = guild.branleurs.at(Math.floor(Math.random() * guild.branleurs.length)-1);
					console.log(tools.generateDate() + "User \"" + branlos +  "\" found");
					replyMsg += "C'est l'heure de la personne random\n";
				} else {
					branlos = tools.findBranlos(message, guild);
				}

				if(date.getHours() == randomHourPoints) {
					replyMsg += "Petit.e chanceux.se, c'est l'heure des 3 points\n";
					ptsWon = 3;
				} else {
					ptsWon = 1;
				}
				
				if(messageContent.startsWith("-NEZ") || messageContent.startsWith("-NOSE")) {
					if(branlos.pts - ptsWon >= 1) {
						branlos.pts = branlos.pts - ptsWon;
						replyMsg += "Cheh " + branlos.name + " Tu as perdu un point, tu as donc " + branlos.pts + " points(s)";
					} else {
						branlos.pts = branlos.pts + 2;
						replyMsg += "Le.a boug a voulu t'enlever un point alors que tu n'en avais déjà plus, abusé non ? pour la peine " + branlos.name + " je t'en donne 2, tu as " + branlos.pts + " points";
					}
				} 
				
				if (messageContent.startsWith("NEZ") || messageContent.startsWith("NOSE")){
					branlos.pts = branlos.pts + ptsWon;
					replyMsg += "Bravo " + branlos.name + " ! Tu as été le.a premier.e à dire \"nez\" au bon moment, tu as " + branlos.pts + " point(s)";
				}

				guild.alreadyWon = true;
				guild.lastMinuteWon = date.getMinutes();
				message.reply(replyMsg);
				console.log(tools.generateDate() + "User " + branlos + " got 1 point");
			} else {
				if (guild.alreadyWonMessagesIndex > alreadyWonMessages.length - 1) {
					guild.alreadyWonMessagesIndex = 0;
				}
				message.reply(alreadyWonMessages[guild.alreadyWonMessagesIndex]);
				guild.alreadyWonMessagesIndex++;
			}

 			newData = JSON.stringify(guilds, null, 4);
			fs.writeFileSync('branleurs.json', newData);
		} else {
			if(message.author.id == 382785159998472192)
				message.reply("Désolé Baptiste, ce n'est pas l'heure, il faut que ce soit le même chiffre des minutes que les heures");
			else
				message.reply(notCorrectHourMessages[tools.getRandomInt(notCorrectHourMessages.length)]);
		}
	}
});
