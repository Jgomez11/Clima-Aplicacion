const fs = require("fs");
const axios = require("axios");
const { parse } = require("path");

class Busquedas {
  historial = [];
  DBPath = "./db/database.json";

  constructor() {
    // leer DB si existe
    this.leerBD();
  }

  get historialCapitalizado() {
    //capitalizar historial
    return this.historial.map((lugar) => {
      let palabras = lugar.split(" ");
      palabras = palabras.map((p) => p[0].toUpperCase() + p.substring(1));
      return palabras.join(" ");
    });
  }
  get paramsMapbox() {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: 5,
      language: "es",
    };
  }

  get paramsOpenWeatherMap() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: "metric",
      lang: "es",
    };
  }

  async ciudades(lugar = "") {
    try {
      //instanciia axios.create()
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox,
      });

      //resp.data
      const resp = await instance.get();
      return resp.data.features.map((lugar) => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lat: lugar.center[1],
        lng: lugar.center[0],
      }));
    } catch (error) {
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      // console.log("object", lat, lon);
      //instanciia axios.create()
      const instance = axios.create({
        baseURL: "https://api.openweathermap.org/data/2.5/weather",
        params: { ...this.paramsOpenWeatherMap, lat, lon },
      });

      //resp.data
      const resp = await instance.get();
      const { weather, main } = resp.data;
      return {
        temp: main.temp,
        min: main.temp_min,
        max: main.temp_max,
        desc: weather[0].description,
      };
    } catch (error) {
      console.log("no se encontro la ciudad");
    }
  }

  agregarHistorial(lugar = "") {
    //Prevenir duplicados
    if (this.historial.includes(lugar.toLocaleLowerCase())) {
      return;
    } else {
      this.historial.unshift(lugar.toLocaleLowerCase());
    }

    //guardar en BD
    this.guardarBD();
  }

  guardarBD() {
    const payload = {
      historial: this.historial,
    };

    fs.writeFileSync(this.DBPath, JSON.stringify(payload));
  }

  leerBD() {
    //debe existir
    if (!fs.existsSync(this.DBPath)) {
      return;
    }
    const info = fs.readFileSync(this.DBPath, { encoding: "utf-8" });
    const data = JSON.parse(info);

    this.historial = data.historial;
  }
}
module.exports = {
  Busquedas,
};
