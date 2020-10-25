import { readFileSync } from "fs";
import { join } from "path";
import { getSunset } from "./get_sun";
import { differenceInMinutes } from "date-fns";

const g = JSON.parse(readFileSync(join(__dirname, "data.geojson"), "utf8")).features;

const schedule = g.map((x) => {
  const coords = x.geometry.coordinates,
    lon = coords[0],
    lat = coords[1],
    sunsetEnd = getSunset(lat, lon).end;

  return {
    name: x.properties.name,
    sunsetEnd,
  };
});

const NOW = new Date();

const sunsets = schedule.filter(sunSetNow).sort(bySunsetEnd);

const list = sunsets.map(
  (x) => `https://www.youtube.com/results?search_query=${x.name}&sp=EgJAAQ%253D%253D`
);

console.log(list.join("\n"));

function bySunsetEnd(a, b) {
  return differenceInMinutes(a.sunsetEnd, NOW) - differenceInMinutes(b.sunsetEnd, NOW);
}

function sunSetNow(x) {
  const timeSinceStart = differenceInMinutes(x.sunsetStart, NOW);
  const timeLeft = differenceInMinutes(x.sunsetEnd, NOW);

  const started = 0 < timeSinceStart && timeSinceStart < 15;
  const notFinished = 0 < timeLeft && timeLeft < 10;

  const validSunset = started && notFinished;

  return validSunset;
}
