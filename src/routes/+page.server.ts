import { getToday } from '$lib/calendar';

export function load() {
	return { today: getToday() };
}
