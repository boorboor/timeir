<script lang="ts">
	import { untrack } from 'svelte';
	import type { TodayData } from '$lib/calendar';
	import {
		gregorianToJalali,
		jalaliToGregorian,
		gregorianToHijri,
		hijriToGregorian,
		jalaliMonthLength,
		gregorianMonthLength,
		hijriMonthLength
	} from '$lib/calendar';
	import { JALALI_MONTHS, HIJRI_MONTHS, GREGORIAN_MONTHS_EN, toPersian } from '$lib/persian';

	interface Props {
		today: TodayData;
	}

	let { today }: Props = $props();

	// ── State: three independent sets of year/month/day ─────────────────────────
	// Initialized once from today; user edits drive updates via fromXxx() helpers
	let jy = $state(untrack(() => today.jalali.jy));
	let jm = $state(untrack(() => today.jalali.jm));
	let jd = $state(untrack(() => today.jalali.jd));

	let gy = $state(untrack(() => today.gregorian.gy));
	let gm = $state(untrack(() => today.gregorian.gm));
	let gd = $state(untrack(() => today.gregorian.gd));

	let hy = $state(untrack(() => today.hijri.hy));
	let hm = $state(untrack(() => today.hijri.hm));
	let hd = $state(untrack(() => today.hijri.hd));

	// ── Dynamic day ranges ───────────────────────────────────────────────────────
	let jalaliDays = $derived(Array.from({ length: jalaliMonthLength(jy, jm) }, (_, i) => i + 1));
	let gregorianDays = $derived(
		Array.from({ length: gregorianMonthLength(gy, gm) }, (_, i) => i + 1)
	);
	let hijriDays = $derived(Array.from({ length: hijriMonthLength(hy, hm) }, (_, i) => i + 1));

	// ── Year ranges ──────────────────────────────────────────────────────────────
	const jalaliYears = Array.from({ length: 151 }, (_, i) => 1300 + i);
	const gregorianYears = Array.from({ length: 151 }, (_, i) => 1921 + i);
	const hijriYears = Array.from({ length: 151 }, (_, i) => 1338 + i);

	// ── Update functions (no circular triggers — $state ≠ DOM change event) ─────
	function fromJalali() {
		if (jd > jalaliMonthLength(jy, jm)) jd = jalaliMonthLength(jy, jm);
		const g = jalaliToGregorian(jy, jm, jd);
		gy = g.gy;
		gm = g.gm;
		gd = g.gd;
		const h = gregorianToHijri(gy, gm, gd);
		hy = h.hy;
		hm = h.hm;
		hd = h.hd;
	}

	function fromGregorian() {
		if (gd > gregorianMonthLength(gy, gm)) gd = gregorianMonthLength(gy, gm);
		const j = gregorianToJalali(gy, gm, gd);
		jy = j.jy;
		jm = j.jm;
		jd = j.jd;
		const h = gregorianToHijri(gy, gm, gd);
		hy = h.hy;
		hm = h.hm;
		hd = h.hd;
	}

	function fromHijri() {
		if (hd > hijriMonthLength(hy, hm)) hd = hijriMonthLength(hy, hm);
		const g = hijriToGregorian(hy, hm, hd);
		gy = g.gy;
		gm = g.gm;
		gd = g.gd;
		const j = gregorianToJalali(gy, gm, gd);
		jy = j.jy;
		jm = j.jm;
		jd = j.jd;
	}

	function resetToToday() {
		jy = today.jalali.jy;
		jm = today.jalali.jm;
		jd = today.jalali.jd;
		gy = today.gregorian.gy;
		gm = today.gregorian.gm;
		gd = today.gregorian.gd;
		hy = today.hijri.hy;
		hm = today.hijri.hm;
		hd = today.hijri.hd;
	}
</script>

<section class="converter" aria-label="تبدیل تاریخ">
	<div class="converter-grid">
		<!-- ── Jalali ─────────────────────────────────────────────── -->
		<div class="cal-section">
			<h2 class="cal-section__title">شمسی (جلالی)</h2>

			<div class="selects">
				<div class="select-group">
					<label for="jy">سال</label>
					<select id="jy" bind:value={jy} onchange={fromJalali}>
						{#each jalaliYears as y (y)}
							<option value={y}>{toPersian(y)}</option>
						{/each}
					</select>
				</div>
				<div class="select-group">
					<label for="jm">ماه</label>
					<select id="jm" bind:value={jm} onchange={fromJalali}>
						{#each JALALI_MONTHS as name, i (i)}
							<option value={i + 1}>{name}</option>
						{/each}
					</select>
				</div>
				<div class="select-group">
					<label for="jd">روز</label>
					<select id="jd" bind:value={jd} onchange={fromJalali}>
						{#each jalaliDays as d (d)}
							<option value={d}>{toPersian(d)}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- ── Gregorian ─────────────────────────────────────────── -->
		<div class="cal-section">
			<h2 class="cal-section__title">میلادی (گرگوری)</h2>

			<div class="selects">
				<div class="select-group">
					<label for="gy">Year</label>
					<select id="gy" bind:value={gy} onchange={fromGregorian}>
						{#each gregorianYears as y (y)}
							<option value={y}>{y}</option>
						{/each}
					</select>
				</div>
				<div class="select-group">
					<label for="gm">Month</label>
					<select id="gm" bind:value={gm} onchange={fromGregorian}>
						{#each GREGORIAN_MONTHS_EN as name, i (i)}
							<option value={i + 1}>{name}</option>
						{/each}
					</select>
				</div>
				<div class="select-group">
					<label for="gd">Day</label>
					<select id="gd" bind:value={gd} onchange={fromGregorian}>
						{#each gregorianDays as d (d)}
							<option value={d}>{d}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>

		<!-- ── Hijri ──────────────────────────────────────────────── -->
		<div class="cal-section">
			<h2 class="cal-section__title">قمری (هجری)</h2>

			<div class="selects">
				<div class="select-group">
					<label for="hy">سال</label>
					<select id="hy" bind:value={hy} onchange={fromHijri}>
						{#each hijriYears as y (y)}
							<option value={y}>{toPersian(y)}</option>
						{/each}
					</select>
				</div>
				<div class="select-group">
					<label for="hm">ماه</label>
					<select id="hm" bind:value={hm} onchange={fromHijri}>
						{#each HIJRI_MONTHS as name, i (i)}
							<option value={i + 1}>{name}</option>
						{/each}
					</select>
				</div>
				<div class="select-group">
					<label for="hd">روز</label>
					<select id="hd" bind:value={hd} onchange={fromHijri}>
						{#each hijriDays as d (d)}
							<option value={d}>{toPersian(d)}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>

	<div class="reset-row">
		<button class="reset-btn" onclick={resetToToday}>بازگشت به امروز</button>
	</div>
</section>

<style>
	.converter {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.converter-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}
	@media (min-width: 768px) {
		.converter-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.cal-section {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 1rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.cal-section__title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-primary);
		margin: 0;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid var(--color-border);
	}

	.selects {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
	}

	.select-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	label {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--color-muted-text);
	}

	select {
		width: 100%;
		padding: 0.55rem 0.75rem;
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		background: var(--color-bg);
		color: var(--color-text);
		font-family: inherit;
		font-size: 0.95rem;
		cursor: pointer;
		appearance: auto;
		transition: border-color 0.15s;
	}
	select:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 1px;
		border-color: var(--color-primary);
	}

	.reset-row {
		text-align: center;
	}

	.reset-btn {
		background: var(--color-primary);
		color: #fff;
		border: none;
		padding: 0.6rem 1.8rem;
		border-radius: 0.6rem;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s;
	}
	.reset-btn:hover {
		background: var(--color-primary-dark);
	}
</style>
