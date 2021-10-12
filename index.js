require("dotenv").config();

const {
  leerInput,
  inquirerMenu,
  pausa,
  listarLugares,
} = require("./helpers/inquirer");
const { Busquedas } = require("./models/busqueda");

const main = async () => {
  const busquedas = new Busquedas();
  let opt;

  do {
    opt = await inquirerMenu();

    switch (opt) {
      case 1:
        //mostrar mensaje
        const termino = await leerInput("Ciudad: ");
        //buscar  lugares
        const lugares = await busquedas.ciudades(termino);

        //seleccionar lugar
        const id = await listarLugares(lugares);
        if (id === "0") continue;

        const lugarSelec = lugares.find((l) => l.id === id);

        //guardar en BD
        busquedas.agregarHistorial(lugarSelec.nombre);

        //datos clima
        const clima = await busquedas.climaLugar(
          lugarSelec.lat,
          lugarSelec.lng
        );
        //mostrar resultados
        console.clear();
        console.log("\n Informacion de la ciudad \n".green);
        console.log("ciudad:", lugarSelec.nombre.green);
        console.log("Lat:", lugarSelec.lat);
        console.log("Lng:", lugarSelec.lng);
        console.log("Temperatura: ", clima.temp);
        console.log("Minima:", clima.min);
        console.log("Maxima:", clima.max);
        console.log("Descripción de clima: ", clima.desc.green);
        break;

      case 2:
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(`${idx} ${lugar}`);
        });
        break;
      default:
        break;
    }

    if (opt !== 0) {
      await pausa();
    }
  } while (opt !== 0);
};

main();
