<script lang="ts">
	import type { JalaliDate, GregorianDate, HijriDate } from '$lib/calendar';
	import { formatJalali, formatGregorian, formatHijri, getDayNamePersian } from '$lib/persian';

	interface Props {
		jalali: JalaliDate;
		gregorian: GregorianDate;
		hijri: HijriDate;
		dayOfWeek: number;
	}

	let { jalali, gregorian, hijri, dayOfWeek }: Props = $props();
</script>

<section class="today-banner" aria-label="تاریخ امروز">
	<!-- Primary Jalali card -->
	<div class="card card--primary">
		<span class="card__label">شمسی</span>
		<strong class="card__day-name">{getDayNamePersian(dayOfWeek)}</strong>
		<span class="card__date">{formatJalali(jalali.jy, jalali.jm, jalali.jd)}</span>
	</div>

	<!-- Gregorian card -->
	<div class="card card--secondary">
		<span class="card__label">میلادی</span>
		<span class="card__date">{formatGregorian(gregorian.gy, gregorian.gm, gregorian.gd)}</span>
	</div>

	<!-- Hijri card -->
	<div class="card card--secondary">
		<span class="card__label">قمری</span>
		<span class="card__date">{formatHijri(hijri.hy, hijri.hm, hijri.hd)}</span>
	</div>
</section>

<style>
	.today-banner {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}
	@media (min-width: 640px) {
		.today-banner {
			grid-template-columns: 1.4fr 1fr 1fr;
		}
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		border-radius: 1rem;
		padding: 1.25rem 1.5rem;
	}
	.card--primary {
		background: var(--color-primary);
		color: #fff;
	}
	.card--secondary {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		color: var(--color-text);
	}

	.card__label {
		font-size: 0.75rem;
		font-weight: 500;
		opacity: 0.7;
		letter-spacing: 0.03em;
	}
	.card--primary .card__label {
		opacity: 0.8;
		color: #fff;
	}
	.card__day-name {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.2;
	}
	.card__date {
		font-size: 1.1rem;
		font-weight: 500;
	}
	.card--secondary .card__date {
		color: var(--color-primary);
		font-size: 1.05rem;
	}
</style>
