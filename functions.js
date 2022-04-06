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
	}
};
