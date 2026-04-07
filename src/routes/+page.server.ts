import { getToday } from '$lib/calendar';
import type { RequestEvent } from '@sveltejs/kit';

export function load({ platform }: RequestEvent) {
	const tz = platform?.cf?.timezone;
	return { today: getToday(tz) };
}
