<script lang="ts">
	import { untrack } from 'svelte';
	import { getCalendarGrid, type JalaliDate } from '$lib/calendar';
	import { JALALI_MONTHS, WEEK_DAYS_SHORT, toPersian } from '$lib/persian';

	interface Props {
		today: JalaliDate;
	}

	let { today }: Props = $props();

	// Initialized once from today; managed independently after that
	let viewJy = $state(untrack(() => today.jy));
	let viewJm = $state(untrack(() => today.jm));

	// When today changes (e.g. SSR→client timezone correction), follow it only
	// if the user hasn't navigated away from the current month.
	let userNavigated = false;
	$effect(() => {
		if (!userNavigated) {
			viewJy = today.jy;
			viewJm = today.jm;
		}
	});

	let grid = $derived(getCalendarGrid(viewJy, viewJm, today));
	let isCurrentMonth = $derived(viewJy === today.jy && viewJm === today.jm);

	function prevMonth() {
		userNavigated = true;
		if (viewJm === 1) {
			viewJm = 12;
			viewJy--;
		} else {
			viewJm--;
		}
	}

	function nextMonth() {
		userNavigated = true;
		if (viewJm === 12) {
			viewJm = 1;
			viewJy++;
		} else {
			viewJm++;
		}
	}

	function prevYear() {
		userNavigated = true;
		viewJy--;
	}

	function nextYear() {
		userNavigated = true;
		viewJy++;
	}

	function goToToday() {
		userNavigated = false;
		viewJy = today.jy;
		viewJm = today.jm;
	}
</script>

<section class="calendar" aria-label="تقویم ماهانه">
	<!-- Navigation header -->
	<div class="cal-header">
		<div class="nav-group">
			<button class="nav-btn" onclick={prevYear} aria-label="سال قبل" title="سال قبل">«</button>
			<button class="nav-btn" onclick={prevMonth} aria-label="ماه قبل" title="ماه قبل">‹</button>
		</div>

		<button class="month-title" onclick={goToToday} title="برگشت به امروز">
			{JALALI_MONTHS[viewJm - 1]}
			{toPersian(viewJy)}
			{#if !isCurrentMonth}
				<span class="today-dot" aria-hidden="true"></span>
			{/if}
		</button>

		<div class="nav-group">
			<button class="nav-btn" onclick={nextMonth} aria-label="ماه بعد" title="ماه بعد">›</button>
			<button class="nav-btn" onclick={nextYear} aria-label="سال بعد" title="سال بعد">»</button>
		</div>
	</div>

	<!-- Weekday header row -->
	<div class="cal-grid">
		{#each WEEK_DAYS_SHORT as day, i}
			<div class="weekday-header" class:friday={i === 6}>{day}</div>
		{/each}

		<!-- Calendar cells -->
		{#each grid as row}
			{#each row as cell, colIdx}
				<div class="cal-cell" class:out-of-month={!cell.isCurrentMonth} class:friday={colIdx === 6}>
					<span class="j-day" class:today={cell.isToday}>
						{toPersian(cell.jalali.jd)}
					</span>
					<span class="g-day">{cell.gregorian.gd}</span>
					<span class="h-day">{toPersian(cell.hijri.hd)}</span>
				</div>
			{/each}
		{/each}
	</div>

	{#if !isCurrentMonth}
		<div class="today-link-row">
			<button class="today-link-btn" onclick={goToToday}>← امروز</button>
		</div>
	{/if}
</section>

<style>
	.calendar {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 1rem;
		overflow: hidden;
	}

	/* ── Header ─────────────────────────────── */
	.cal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.85rem 1rem;
		background: var(--color-primary);
		color: #fff;
	}

	.nav-group {
		display: flex;
		gap: 0.15rem;
	}

	.nav-btn {
		background: none;
		border: none;
		color: #fff;
		font-size: 1.3rem;
		cursor: pointer;
		padding: 0.2rem 0.45rem;
		border-radius: 0.4rem;
		line-height: 1;
		opacity: 0.85;
		transition:
			opacity 0.15s,
			background 0.15s;
	}
	.nav-btn:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.15);
	}

	.month-title {
		background: none;
		border: none;
		color: #fff;
		font-size: 1.15rem;
		font-weight: 700;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.2rem 0.6rem;
		border-radius: 0.4rem;
		transition: background 0.15s;
	}
	.month-title:hover {
		background: rgba(255, 255, 255, 0.12);
	}

	.today-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.7);
	}

	/* ── Grid ───────────────────────────────── */
	.cal-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	.weekday-header {
		text-align: center;
		padding: 0.55rem 0;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--color-muted-text);
		background: var(--color-bg-subtle);
		border-bottom: 1px solid var(--color-border);
	}
	.weekday-header.friday {
		color: var(--color-friday);
	}

	.cal-cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.4rem 0.1rem 0.35rem;
		border-bottom: 1px solid var(--color-border);
		border-inline-start: 1px solid var(--color-border);
		min-height: 3.8rem;
		gap: 0.05rem;
	}
	/* Remove double border on first column */
	.cal-cell:nth-child(7n + 8) {
		border-inline-start: none;
	}

	.cal-cell.out-of-month {
		background: var(--color-bg-subtle);
	}
	.cal-cell.out-of-month .j-day,
	.cal-cell.out-of-month .g-day,
	.cal-cell.out-of-month .h-day {
		opacity: 0.35;
	}

	.cal-cell.friday .j-day {
		color: var(--color-friday);
	}
	.cal-cell.friday.out-of-month .j-day {
		color: var(--color-friday);
		opacity: 0.3;
	}

	/* Day number spans */
	.j-day {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition:
			background 0.15s,
			color 0.15s;
	}
	.j-day.today {
		background: var(--color-primary);
		color: #fff !important;
	}

	.g-day,
	.h-day {
		font-size: 0.62rem;
		line-height: 1;
		color: var(--color-muted-text);
	}
	/* Hide secondary dates on very small screens */
	@media (max-width: 400px) {
		.g-day,
		.h-day {
			display: none;
		}
		.cal-cell {
			min-height: 2.8rem;
		}
	}

	/* ── Today link ─────────────────────────── */
	.today-link-row {
		padding: 0.5rem 1rem;
		text-align: center;
		border-top: 1px solid var(--color-border);
	}
	.today-link-btn {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		padding: 0.3rem 0.7rem;
		border-radius: 0.4rem;
		transition: background 0.15s;
	}
	.today-link-btn:hover {
		background: var(--color-bg-subtle);
	}
</style>
