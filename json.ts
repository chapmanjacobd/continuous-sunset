import { readFileSync } from "fs";
import { join } from "path";
import { getSunset } from "./get_sun";
import { differenceInMinutes } from "date-fns";

const g = JSON.parse(readFileSync(join(__dirname, "data.geojson"), "utf8")).features;

const p = g.map((x) => x.properties);
const gHubName = groupBy(p, "HubName");

let filterIds = [];
for (const key in gHubName) {
  if (Object.prototype.hasOwnProperty.call(gHubName, key)) {
    const element = gHubName[key];
    filterIds.push(element[0]);
  }
}
const f = g.filter((x) => filterIds.includes(x.properties.ne_id));

const schedule = g.map((x) => {
  const coords = x.geometry.coordinates,
    lon = coords[0],
    lat = coords[1],
    sunsetStart = getSunset(lat, lon).start,
    sunsetEnd = getSunset(lat, lon).end;

  return {
    name: x.properties.name,
    sunsetStart,
    sunsetEnd,
  };
});

// var sunsets;

// setTimeout(() => {
//   sunsets = schedule.filter(sunSetNow);
// }, 3000 * 60);
const NOW = new Date();

const sunsets = schedule.filter(sunSetNow).sort(bySunsetEnd);

const list = sunsets.map(
  (x) => `https://www.youtube.com/results?search_query=${x.name}&sp=EgJAAQ%253D%253D`
);

list;

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

function groupBy(objectArray, property) {
  return objectArray.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    // Add object to list for given key's value
    acc[key].push(obj);
    return acc;
  }, {});
}
