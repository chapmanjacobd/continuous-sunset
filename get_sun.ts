const MS_IN_DAY = 1000 * 60 * 60 * 24,
  J1970 = 2440588,
  J2000 = 2451545,
  DEG_2_RAD = Math.PI / 180,
  M0 = 357.5291 * DEG_2_RAD,
  M1 = 0.98560028 * DEG_2_RAD,
  J0 = 0.0009,
  J1 = 0.0053,
  J2 = -0.0069,
  C1 = 1.9148 * DEG_2_RAD,
  C2 = 0.02 * DEG_2_RAD,
  C3 = 0.0003 * DEG_2_RAD,
  P = 102.9372 * DEG_2_RAD,
  e = 23.45 * DEG_2_RAD,
  sunAngle = -0.83 * DEG_2_RAD,
  sunDiameter = 0.53 * DEG_2_RAD;

function dateToJulianDate(date: number | Date) {
  return date.valueOf() / MS_IN_DAY - 0.5 + J1970;
}

function julianDateToDate(j: number) {
  return new Date((j + 0.5 - J1970) * MS_IN_DAY);
}

function getJulianCycle(J: number, lw: number) {
  return Math.round(J - J2000 - J0 - lw / (2 * Math.PI));
}

function getApproxSolarTransit(Ht: number, lw: number, n: number) {
  return J2000 + J0 + (Ht + lw) / (2 * Math.PI) + n;
}

function getSolarMeanAnomaly(Js: number) {
  return M0 + M1 * (Js - J2000);
}

function getEquationOfCenter(M: number) {
  return C1 * Math.sin(M) + C2 * Math.sin(2 * M) + C3 * Math.sin(3 * M);
}

function getEclipticLongitude(M: number, C: number) {
  return M + P + C + Math.PI;
}

function getSolarTransit(Js: number, M: number, Lsun: number) {
  return Js + J1 * Math.sin(M) + J2 * Math.sin(2 * Lsun);
}

function getSunDeclination(Lsun: number) {
  return Math.asin(Math.sin(Lsun) * Math.sin(e));
}

function getHourAngle(h: number, phi: number, d: number) {
  return Math.acos((Math.sin(h) - Math.sin(phi) * Math.sin(d)) / (Math.cos(phi) * Math.cos(d)));
}

function getSunsetJulianDate(w0: number, M: number, Lsun: any, lw: number, n: number) {
  return getSolarTransit(getApproxSolarTransit(w0, lw, n), M, Lsun);
}

export function getSunset(lat: number, lng: number) {
  var lw = -lng * DEG_2_RAD,
    phi = lat * DEG_2_RAD,
    J = dateToJulianDate(new Date());

  var n = getJulianCycle(J, lw),
    Js = getApproxSolarTransit(0, lw, n),
    M = getSolarMeanAnomaly(Js),
    C = getEquationOfCenter(M),
    Lsun = getEclipticLongitude(M, C),
    d = getSunDeclination(Lsun),
    w0 = getHourAngle(sunAngle, phi, d),
    w1 = getHourAngle(sunAngle + sunDiameter, phi, d),
    sunsetEnd = getSunsetJulianDate(w0, M, Lsun, lw, n),
    sunsetStart = getSunsetJulianDate(w1, M, Lsun, lw, n);

  return {
    start: julianDateToDate(sunsetStart),
    end: julianDateToDate(sunsetEnd),
  };
}
