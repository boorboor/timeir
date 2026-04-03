// Persian text utilities — month names, day names, digit conversion

export const JALALI_MONTHS = [
	'فروردین',
	'اردیبهشت',
	'خرداد',
	'تیر',
	'مرداد',
	'شهریور',
	'مهر',
	'آبان',
	'آذر',
	'دی',
	'بهمن',
	'اسفند'
] as const;

export const HIJRI_MONTHS = [
	'محرم',
	'صفر',
	'ربیع‌الاول',
	'ربیع‌الثانی',
	'جمادی‌الاول',
	'جمادی‌الثانی',
	'رجب',
	'شعبان',
	'رمضان',
	'شوال',
	'ذی‌القعده',
	'ذی‌الحجه'
] as const;

export const GREGORIAN_MONTHS_FA = [
	'ژانویه',
	'فوریه',
	'مارس',
	'آوریل',
	'مه',
	'ژوئن',
	'ژوئیه',
	'اوت',
	'سپتامبر',
	'اکتبر',
	'نوامبر',
	'دسامبر'
] as const;

export const GREGORIAN_MONTHS_EN = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
] as const;

// Iranian week: Sat(0) … Fri(6)
export const WEEK_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] as const;
export const WEEK_DAYS_FULL = [
	'شنبه',
	'یکشنبه',
	'دوشنبه',
	'سه‌شنبه',
	'چهارشنبه',
	'پنجشنبه',
	'جمعه'
] as const;

const PD = '۰۱۲۳۴۵۶۷۸۹';

/** Replace ASCII digits with Persian (Eastern Arabic) digits. */
export function toPersian(n: number | string): string {
	return String(n).replace(/[0-9]/g, (d) => PD[+d]);
}

/** Convert JS Date.getDay() (0=Sun … 6=Sat) to the Persian day name. */
export function getDayNamePersian(jsDow: number): string {
	return WEEK_DAYS_FULL[(jsDow + 1) % 7];
}

/** e.g. "۱۴ فروردین ۱۴۰۴" */
export function formatJalali(jy: number, jm: number, jd: number): string {
	return `${toPersian(jd)} ${JALALI_MONTHS[jm - 1]} ${toPersian(jy)}`;
}

/** e.g. "3 April 2026" */
export function formatGregorian(gy: number, gm: number, gd: number): string {
	return `${gd} ${GREGORIAN_MONTHS_EN[gm - 1]} ${gy}`;
}

/** e.g. "۵ رمضان ۱۴۴۷" */
export function formatHijri(hy: number, hm: number, hd: number): string {
	return `${toPersian(hd)} ${HIJRI_MONTHS[hm - 1]} ${toPersian(hy)}`;
}
