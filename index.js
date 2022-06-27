const fs = require('fs');
const schedule = require('node-schedule');
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const tools = require('./functions.js');
const { getRandomInt } = require('./functions.js');

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
let wordToBeFound = tools.getNewWord(fs);
let splittedMessage = [];
let diceResult = 0;

console.log(wordToBeFound);

const jobRandomHours = schedule.scheduleJob('0 0 0 * * *', function() {
	randomHourPoints = tools.getRandomInt(24);
	randomHourRandomPlayer = tools.getRandomInt(24);
	console.log(tools.generateDate() + "Random numbers reset");
	wordToBeFound = tools.getNewWord(fs);
	console.log(wordToBeFound);
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

	if (messageContent.startsWith("JDR")) {
		splittedMessage = messageContent.split(" ");
		diceResult = 0;
		replyMsg = "";

		if (splittedMessage.length < 2) {
			message.reply("j'ai pas compris quel dé tu veux lancer");
			return;
		}

		if (splittedMessage[1].split("+") === 2) {
			diceResult = Number.parseInt(splittedMessage[1].split("+")[1]);
		}

		if (splittedMessage[1].split("-") === 2) {
			diceResult = 0 - Number.parseInt(splittedMessage[1].split("-")[1]);
		}

		replyMsg += "Tu as fait :";
		for (i = 0; i < Number.parseInt(splittedMessage[1].match(/D([0-9]*)/)[1]); i++) {
			replyMsg += "\n" +  (tools.getRandomInt(splittedMessage[3]) + diceResult + 1);
		}

		message.reply(replyMsg);

		return;
	}

	if (guild === undefined){
		guild = {id: message.guild.id, branleurs: [], alreadyWon: false, alreadyWonMessagesIndex: 0, lastMinutesWon: (date.getHours() - 1), wordFound: false, predator: [{charge: 0}, {used: false}]};
		console.log("guild :" + guild.name + " created");
		guilds.push(guild);
		fs.writeFileSync('branleurs.json', JSON.stringify(guilds, null, 4));
		console.log(tools.generateDate() + "Guilds serialized");
	}

	if (messageContent === "NEZ RESULTATS") {
		message.reply(tools.sortBranleurs(JSON.parse(fs.readFileSync('branleurs_last_week.json')), guild));
		return;
	}

	if (messageContent === "NEZ CLASSEMENT") {
		message.reply(tools.sortBranleurs(guilds, guild));
		return;
	}

	if (messageContent === "MATTHIEU EST RENTRÉ" || messageContent === "MATTBIEURT EST RENTRÉ" || (messageContent === "JE SUIS RENTRÉ" && message.author.id == 303274212091625472)) {
		message.reply("MATTHIEU EST DE RETOUR OUIII");
		return;
	}

	if (messageContent === "MATTHIEU N'EST PAS ENCORE REVENU MAIS REVIENT DIMANCHE" || (messageContent === "JE SUIS PAS ENCORE REVENU MAIS JE REVIENS DIMANCHE" && message.author.id == 303274212091625472) || (messageContent === "JE NE SUIS PAS ENCORE REVENU MAIS JE REVIENS DIMANCHE" && message.author.id == 303274212091625472)) {
		message.reply("YOUHOU MATTHIEU N'EST PAS ENCORE REVENU MAIS IL REVIENT DIMANCHE YOUPII");
		return;
	}

	if (messageContent === "MATTHIEU C'EST DIMANCHE TU ES CENSÉ ÊTRE REVENU") {
		message.reply("Il abuse j'ai pas raison la miff ?");
		return;
	}

	if (messageContent.includes(wordToBeFound)) {
		if(guild.wordFound === false) {
			branlos = tools.findBranlos(message, guild);
			guild.wordFound = true;
			branlos.pts = branlos.pts + 25;
			replyMsg += "Bravo " + branlos.name + " ! Tu as été le.a premier.e à trouver le mot secret \"" + wordToBeFound + "\", tu as " + branlos.pts + " point(s)";

			newData = JSON.stringify(guilds, null, 4);
			fs.writeFileSync('branleurs.json', newData);

			message.reply(replyMsg);
		}
	}

	if (messageContent.startsWith("NEZ DONATION <@")) {
		if (message.mentions.users.size > 0 && Number.isInteger(Number.parseInt(messageContent.split(' ').at(3)))) {
			branlos = guild.branleurs.find(branleur => branleur.id === message.mentions.users.at(0).id);
			if (branlos === undefined) {
				branlos = {id: message.mentions.users.at(0).id, name: message.mentions.users.at(0).username, pts: 0};
				guild.branleurs.push(branlos);
			}

			let donor = guild.branleurs.find(donor => donor.id === message.author.id);

			if (undefined == donor) {
				message.reply("TU N'ES MEME PAS DANS LE CLASSEMENT ANDOUILLE");
				
				return;
			}

			if(Number.parseInt(messageContent.split(' ').at(3)) >= 0) {
				if((donor.pts - Number.parseInt(messageContent.split(' ').at(3))) >= 0) {
					branlos.pts += Number.parseInt(messageContent.split(' ').at(3));
					donor.pts -= Number.parseInt(messageContent.split(' ').at(3));
	
					newData = JSON.stringify(guilds, null, 4);
					fs.writeFileSync('branleurs.json', newData);
	
	
					message.reply("YOU'RE SO CHARITABLE YOU GAVE " + Number.parseInt(messageContent.split(' ').at(3)) + " points to " + branlos.name);
	
					return;
				}
			}

			message.reply("Tu ne peux pas donner plus que ce que tu as !");
		}

		return;
	}

	if (messageContent.startsWith("NEZ ADMIN DONATION <@") && message.author.id == 182171696004857866) {
		if (message.mentions.users.size > 0 && Number.isInteger(Number.parseInt(messageContent.split(' ').at(4)))) {
			branlos = guild.branleurs.find(branleur => branleur.id === message.mentions.users.at(0).id);

			if (branlos === undefined) {
				branlos = {id: message.mentions.users.at(0).id, name: message.mentions.users.at(0).username, pts: 0};
				guild.branleurs.push(branlos);
			}

			branlos.pts += Number.parseInt(messageContent.split(' ').at(4));

			newData = JSON.stringify(guilds, null, 4);
			fs.writeFileSync('branleurs.json', newData);

			message.reply(branlos.name + " a eu " + Number.parseInt(messageContent.split(' ').at(4)) + " points, tu as donc " + branlos.pts + " point(s)");
		}

		return;
	}

	if(messageContent.startsWith("MISSILE PREDATOR") && (message.author.id == 382785159998472192 || message.author.id == 149141535705792512)) {
		if(date.getHours() === date.getMinutes()) {
			if (messageContent.startsWith("MISSILE PREDATOR CHARGEMENT")) {
				if (guild.predator.charge < 2) {
					guild.predator.charge++;

					newData = JSON.stringify(guilds, null, 4);
					fs.writeFileSync('branleurs.json', newData);
					
					message.reply("Missile predator chargé, il a désormais " + guild.predator.charge + " charge(s)");
					
					return;
				}

				message.reply("Missile predator déjà chargé à fond");

				return;
			}

			if(guild.predator.used) {
				message.reply("Le missile a déjà été utilisé, il faudrait attendre lundi à 00h");

				return;
			}

			if(date.getDay() == 0 && date.getMinutes() == 23) {
				if (guild.predator.charge < 2) {
					guild.branleurs.forEach(branlos => {
						branlos.pts -= Math.ceil(branlos.pts - (branlos.pts * ((40 + (10 * tools.getRandomInt(2))) / 100)));
					});
					
					replyMsg = "BOOM tous le monde a perdu des points ! Entre 20% et 40% de vos points sont sûrement perdus !";
				} else {
					guild.branleurs.forEach(branlos => {
						branlos.pts = 0;
					});
					
					replyMsg = "BOOM plus personne n'a de point ! Tout se jouera à 23h32...";
				}
			} else {
				if (message.mentions.users.size > 0) {
					branlos = guild.branleurs.find(branleur => branleur.id === message.mentions.users.at(0).id);
			
					if (branlos === undefined) {
						message.reply("La cible n'a pas été trouvée");
			
						return;
					}
	
					branlos.pts -= Math.ceil(branlos.pts - (branlos.pts * ((50 + (10 * guild.predator.charge)) / 100)));
					replyMsg = "BOOM " + branlos.name + " a perdu la beaucoup de ses points !";
				} else {
					guild.branleurs.forEach(branlos => {
						branlos.pts -= Math.ceil(branlos.pts - (branlos.pts * ((20 + (10 * guild.predator.charge)) / 100)));
					});
					
					replyMsg = "BOOM tout le monde a perdu 20% de ses points !";
				}
			}

			guild.predator.charge = 0;
			guild.predator.used = true;
			
			newData = JSON.stringify(guilds, null, 4);
			fs.writeFileSync('branleurs.json', newData);

			message.reply(replyMsg);

			return;
		}

		message.reply("IL N'EST PAS L'HEURE ESPECE DE CON");

		return;
	}

	if (messageContent.startsWith("NEZ") || messageContent.startsWith("NOSE") || messageContent.startsWith("-NEZ") || messageContent.startsWith("-NOSE")) {
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
					if (message.mentions.users.size > 0) {
						branlos = guild.branleurs.find(branleur => branleur.id === message.mentions.users.at(0).id);
						
						if (branlos === undefined) {
							branlos = {id: message.mentions.users.at(0).id, name: message.mentions.users.at(0).username, pts: 0};
							guild.branleurs.push(branlos);
						}
					} else {
						branlos = guild.branleurs.find(branleur => branleur.id === message.author.id);

						if (branlos === undefined) {
							branlos = {id: message.author.id, name: message.author.username, pts: 0};
							guild.branleurs.push(branlos);
						}
					}
				}

				if(date.getHours() == randomHourPoints) {
					replyMsg += "Petit.e chanceux.se, c'est l'heure des 3 points\n";
					ptsWon = 3;
				} else {
					ptsWon = 1;
				}
				
				if(messageContent.startsWith("-NEZ") || messageContent.startsWith("-NOSE")) {
					if(branlos.pts - ptsWon >= 0) {
						branlos.pts = branlos.pts - ptsWon;
						replyMsg += "Cheh " + branlos.name + " Tu as perdu " + ptsWon + " point, tu as donc " + branlos.pts + " points(s)";
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
