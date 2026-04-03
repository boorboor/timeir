import pkg from 'jalaali-js';
const {
	toJalaali,
	toGregorian,
	jalaaliMonthLength: jMonthLen
} = pkg as {
	toJalaali: (gy: number, gm: number, gd: number) => { jy: number; jm: number; jd: number };
	toGregorian: (jy: number, jm: number, jd: number) => { gy: number; gm: number; gd: number };
	jalaaliMonthLength: (jy: number, jm: number) => number;
};

export interface JalaliDate {
	jy: number;
	jm: number;
	jd: number;
}

export interface GregorianDate {
	gy: number;
	gm: number;
	gd: number;
}

export interface HijriDate {
	hy: number;
	hm: number;
	hd: number;
}

export interface TodayData {
	jalali: JalaliDate;
	gregorian: GregorianDate;
	hijri: HijriDate;
	dayOfWeek: number; // JS Date.getDay(): 0=Sun … 6=Sat
}

export interface CalendarCell {
	jalali: JalaliDate;
	gregorian: GregorianDate;
	hijri: HijriDate;
	isToday: boolean;
	isCurrentMonth: boolean;
}

// ─── Julian Day helpers ────────────────────────────────────────────────────────

function gregorianToJD(gy: number, gm: number, gd: number): number {
	const a = Math.floor((14 - gm) / 12);
	const y = gy + 4800 - a;
	const m = gm + 12 * a - 3;
	return (
		gd +
		Math.floor((153 * m + 2) / 5) +
		365 * y +
		Math.floor(y / 4) -
		Math.floor(y / 100) +
		Math.floor(y / 400) -
		32045
	);
}

function jdToGregorian(jd: number): GregorianDate {
	let l = jd + 68569;
	const n = Math.floor((4 * l) / 146097);
	l = l - Math.floor((146097 * n + 3) / 4);
	const i = Math.floor((4000 * (l + 1)) / 1461001);
	l = l - Math.floor((1461 * i) / 4) + 31;
	const j = Math.floor((80 * l) / 2447);
	const gd = l - Math.floor((2447 * j) / 80);
	l = Math.floor(j / 11);
	const gm = j + 2 - 12 * l;
	const gy = 100 * (n - 49) + i + l;
	return { gy, gm, gd };
}

// Tabular Islamic calendar (Thursday epoch, used by most software)
function jdToHijri(jd: number): HijriDate {
	const l = jd - 1948440 + 10632;
	const n = Math.floor((l - 1) / 10631);
	const l2 = l - 10631 * n + 354;
	const j =
		Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
		Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
	const l3 =
		l2 -
		Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
		Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
		29;
	const hm = Math.floor((24 * l3) / 709);
	const hd = l3 - Math.floor((709 * hm) / 24);
	const hy = 30 * n + j - 30;
	return { hy, hm, hd };
}

function hijriToJD(hy: number, hm: number, hd: number): number {
	return (
		Math.floor((11 * hy + 3) / 30) +
		354 * hy +
		30 * hm -
		Math.floor((hm - 1) / 2) +
		hd +
		1948440 -
		385
	);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
	const r = toJalaali(gy, gm, gd);
	return { jy: r.jy, jm: r.jm, jd: r.jd };
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): GregorianDate {
	const r = toGregorian(jy, jm, jd);
	return { gy: r.gy, gm: r.gm, gd: r.gd };
}

export function gregorianToHijri(gy: number, gm: number, gd: number): HijriDate {
	return jdToHijri(gregorianToJD(gy, gm, gd));
}

export function hijriToGregorian(hy: number, hm: number, hd: number): GregorianDate {
	return jdToGregorian(hijriToJD(hy, hm, hd));
}

export function jalaliMonthLength(jy: number, jm: number): number {
	return jMonthLen(jy, jm);
}

export function gregorianMonthLength(gy: number, gm: number): number {
	return new Date(gy, gm, 0).getDate();
}

export function isHijriLeapYear(hy: number): boolean {
	return (11 * hy + 14) % 30 < 11;
}

export function hijriMonthLength(hy: number, hm: number): number {
	if (hm % 2 === 1) return 30;
	if (hm === 12) return isHijriLeapYear(hy) ? 30 : 29;
	return 29;
}

export function getToday(): TodayData {
	const now = new Date();
	const gy = now.getFullYear();
	const gm = now.getMonth() + 1;
	const gd = now.getDate();
	return {
		jalali: gregorianToJalali(gy, gm, gd),
		gregorian: { gy, gm, gd },
		hijri: gregorianToHijri(gy, gm, gd),
		dayOfWeek: now.getDay()
	};
}

/**
 * Returns a 6×7 CalendarCell grid for the given Jalali month.
 * Columns: 0=شنبه … 6=جمعه (week starts Saturday, as per Iranian calendar).
 */
export function getCalendarGrid(jy: number, jm: number, todayJalali: JalaliDate): CalendarCell[][] {
	const firstGreg = jalaliToGregorian(jy, jm, 1);
	const jsDow = new Date(firstGreg.gy, firstGreg.gm - 1, firstGreg.gd).getDay();
	// Map JS day-of-week to Iranian column: Sat(6)→0, Sun(0)→1, …, Fri(5)→6
	const startCol = (jsDow + 1) % 7;

	const daysInMonth = jalaliMonthLength(jy, jm);

	let prevJm = jm - 1,
		prevJy = jy;
	if (prevJm === 0) {
		prevJm = 12;
		prevJy--;
	}
	const prevLen = jalaliMonthLength(prevJy, prevJm);

	let nextJm = jm + 1,
		nextJy = jy;
	if (nextJm === 13) {
		nextJm = 1;
		nextJy++;
	}

	const cells: CalendarCell[] = [];

	for (let i = startCol - 1; i >= 0; i--) {
		const jd = prevLen - i;
		const g = jalaliToGregorian(prevJy, prevJm, jd);
		cells.push({
			jalali: { jy: prevJy, jm: prevJm, jd },
			gregorian: g,
			hijri: gregorianToHijri(g.gy, g.gm, g.gd),
			isToday: false,
			isCurrentMonth: false
		});
	}

	for (let jd = 1; jd <= daysInMonth; jd++) {
		const g = jalaliToGregorian(jy, jm, jd);
		cells.push({
			jalali: { jy, jm, jd },
			gregorian: g,
			hijri: gregorianToHijri(g.gy, g.gm, g.gd),
			isToday: todayJalali.jy === jy && todayJalali.jm === jm && todayJalali.jd === jd,
			isCurrentMonth: true
		});
	}

	for (let jd = 1; cells.length < 42; jd++) {
		const g = jalaliToGregorian(nextJy, nextJm, jd);
		cells.push({
			jalali: { jy: nextJy, jm: nextJm, jd },
			gregorian: g,
			hijri: gregorianToHijri(g.gy, g.gm, g.gd),
			isToday: false,
			isCurrentMonth: false
		});
	}

	const grid: CalendarCell[][] = [];
	for (let r = 0; r < 6; r++) grid.push(cells.slice(r * 7, r * 7 + 7));
	return grid;
}
