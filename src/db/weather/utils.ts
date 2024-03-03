type WeatherId =
	| 200
	| 201
	| 202
	| 210
	| 211
	| 212
	| 221
	| 230
	| 231
	| 232
	| 300
	| 301
	| 302
	| 310
	| 311
	| 312
	| 313
	| 314
	| 321
	| 500
	| 501
	| 502
	| 503
	| 504
	| 511
	| 520
	| 521
	| 522
	| 531
	| 600
	| 601
	| 602
	| 611
	| 612
	| 613
	| 615
	| 616
	| 620
	| 621
	| 622
	| 701
	| 711
	| 721
	| 731
	| 741
	| 751
	| 761
	| 762
	| 771
	| 781
	| 800
	| 801
	| 802
	| 803
	| 804;

export const getWeatherCondition = (id: WeatherId) => {
	if (id >= 200 && id < 300) {
		return "Thunderstorm";
	} else if (id >= 300 && id < 400) {
		return "Drizzle";
	} else if (id >= 400 && id < 500) {
		throw new Error("Incorrect 'id'");
	} else if (id >= 500 && id < 600) {
		return "Rain";
	} else if (id >= 600 && id < 700) {
		return "Snow";
	} else if (id >= 700 && id < 800) {
		switch (id) {
			case 701:
				return "Mist";
			case 711:
				return "Smoke";
			case 721:
				return "Haze";
			case 731:
				return "Dust";
			case 741:
				return "Fog";
			case 751:
				return "Sand";
			case 761:
				return "Dust";
			case 762:
				return "Ash";
			case 771:
				return "Squall";
			case 781:
				return "Tornado";
			default:
				throw new Error("Incorrect 'id'");
		}
	} else if (id === 800) {
		return "Clear";
	} else if (id > 800 && id < 900) {
		return "Clouds";
	} else {
		throw new Error("Incorrect 'id'");
	}
};

export const getWeatherDescription = (id: WeatherId) => {
	switch (id) {
		case 200:
			return "thunderstorm with light rain";
		case 201:
			return "thunderstorm with rain";
		case 202:
			return "thunderstorm with heavy rain";
		case 210:
			return "light thunderstorm";
		case 211:
			return "thunderstorm";
		case 212:
			return "heavy thunderstorm";
		case 221:
			return "ragged thunderstorm";
		case 230:
			return "thunderstorm with light drizzle";
		case 231:
			return "thunderstorm with drizzle";
		case 232:
			return "thunderstorm with heavy drizzle";

		case 300:
			return "light intensity drizzle";
		case 301:
			return "drizzle";
		case 302:
			return "heavy intensity drizzle";
		case 310:
			return "light intensity drizzle rain";
		case 311:
			return "drizzle rain";
		case 312:
			return "heavy intensity drizzle rain";
		case 313:
			return "shower rain and drizzle";
		case 314:
			return "heavy shower rain and drizzle";
		case 321:
			return "shower drizzle";

		case 500:
			return "light rain";
		case 501:
			return "moderate rain";
		case 502:
			return "heavy intensity rain";
		case 503:
			return "very heavy rain";
		case 504:
			return "extreme rain";
		case 511:
			return "freezing rain";
		case 520:
			return "light intensity shower rain";
		case 521:
			return "shower rain";
		case 522:
			return "heavy intensity shower rain";
		case 531:
			return "ragged shower rain";

		case 600:
			return "light snow";
		case 601:
			return "snow";
		case 602:
			return "heavy snow";
		case 611:
			return "sleet";
		case 612:
			return "light shower sleet";
		case 613:
			return "shower sleet";
		case 615:
			return "light rain and snow";
		case 616:
			return "rain and snow";
		case 620:
			return "light shower snow";
		case 621:
			return "shower snow";
		case 622:
			return "heavy shower snow";

		case 701:
			return "mist";
		case 711:
			return "smoke";
		case 721:
			return "haze";
		case 731:
			return "sand/dust whirls";
		case 741:
			return "fog";
		case 751:
			return "sand";
		case 761:
			return "dust";
		case 762:
			return "volcanic ash";
		case 771:
			return "squalls";
		case 781:
			return "tornado";

		case 800:
			return "clear sky";
		case 801:
			return "few clouds: 11-25%";
		case 802:
			return "scattered clouds: 25-50%";
		case 803:
			return "broken clouds: 51-84%";
		case 804:
			return "overcast clouds: 85-100%";

		default:
			throw new Error("Incorrect 'id'");
	}
};

export const getWeatherIcon = (id: WeatherId) => {
	if (id >= 200 && id < 300) {
		return "11";
	} else if (id >= 300 && id < 400) {
		return "09";
	} else if (id >= 500 && id < 600) {
		if (id <= 504) {
			return "10";
		} else if (id === 511) {
			return "13";
		} else if (id >= 520) {
			return "09";
		}
	} else if (id >= 600 && id < 700) {
		return "13";
	} else if (id >= 700 && id < 800) {
		return "50";
	} else if (id >= 800 && id < 900) {
		switch (id) {
			case 800:
				return "01";
			case 801:
				return "02";
			case 802:
				return "03";
			case 803:
				return "04";
			case 804:
				return "04";
			default:
				throw new Error("Incorrect 'id'");
		}
	} else {
		throw new Error("Incorrect 'id'");
	}
};
