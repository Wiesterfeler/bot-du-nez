module.exports = {
	generateDate: function() {
		date = new Date()
		return date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": ";
	},
	getRandomInt: function(max) {
		return Math.floor(Math.random() * max);
	},
	findBranlos: function(message, guild) {
		let branlos = guild.branleurs.find(branleur => branleur.id === message.author.id);

		if (branlos !== undefined) {
			if (message.mentions.users.size > 0) {
				branlos = message.mentions.users.at(0);
			}
			
			console.log(date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": " + "User \"" + branlos +  "\" found");
		} else {
			console.log(date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": " + "User not found");
			branlos = {id: message.author.id, name: message.author.username, pts: 0};
			guild.branleurs.push(branlos);
			console.log(date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": " + "User " + branlos + " created");
		}

		return branlos;
	},
	getNewWord: function(fs) {
		
		let words = fs.readFileSync('words.txt').toString().split('\n');

		let lineWord =  Math.floor(Math.random() * 451277) - 1;

		return words.find((element, index) => index > lineWord).toUpperCase();
	},
	sortBranleurs: function(guilds, guild) {
		branleurs = guilds.find(branleur => branleur.id === guild.id).branleurs;

		let sortedBranleurs = branleurs.sort(function(a, b) {
			return b.pts - a.pts;
		});

		let standings = "";
		let i = 1;
		sortedBranleurs.forEach(branleur => {
			standings += i + " : " + branleur.name + " avec " + branleur.pts + " point(s)\n";
			i++;
		});

		if(standings === "")
			return "Personne n'est dans le classement";

		return standings;
	}
};
