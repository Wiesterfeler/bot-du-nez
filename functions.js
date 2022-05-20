module.exports = {
	generateDate: function() {
		date = new Date()
		return date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear() + " - " + date.getHours() + "-" + date.getMinutes() + "-" + date.getSeconds() + ": ";
	},
	getRandomInt: function(max) {
		return Math.floor(Math.random() * max);
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
	},
	setWord: function(readline) {
		let rl = readline.createInterface({
			input: fs.createReadStream('words.txt')
		});

		let nbLine = 0;
		let lineWord = tools.getRandomInt(257);
		rl.on('line', (line) => {
				if (nbLine++ === lineWord-1) {
						let wordToBeFound = line;
						rl.close();
				}
		});

		rl.on('close', () => {
				console.log("word: " + wordToBeFound);
				readline.moveCursor(0, 0);
				rl.removeAllListeners();
		});

		console.log("Word set");

		return wordToBeFound.toUpperCase();
	}
};
