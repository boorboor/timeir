<script lang="ts">
	import { untrack } from 'svelte';
	import { resolveRoute } from '$app/paths';
	import { getToday } from '$lib/calendar';
	import TodayBanner from '$lib/components/TodayBanner.svelte';
	import CalendarGrid from '$lib/components/CalendarGrid.svelte';
	import DateConverter from '$lib/components/DateConverter.svelte';

	let { data } = $props();

	// Use server-rendered data for SSR/SEO; sync to client local timezone on mount
	let today = $state(untrack(() => data.today));
	$effect(() => {
		today = getToday();
	});

	let activeTab = $state<'calendar' | 'converter'>('calendar');
</script>

<svelte:head>
	<title>تقویم شمسی – امروز {today.jalali.jy}/{today.jalali.jm}/{today.jalali.jd}</title>
	<meta
		name="description"
		content="تقویم آنلاین شمسی، میلادی و قمری. تبدیل تاریخ بین سه تقویم جلالی، گرگوری و هجری قمری."
	/>
</svelte:head>

<div class="page">
	<!-- ── Header ─────────────────────────────────────────────────── -->
	<header class="site-header">
		<div class="header-inner">
			<a href={resolveRoute('/')} class="logo">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
					<line x1="16" y1="2" x2="16" y2="6"></line>
					<line x1="8" y1="2" x2="8" y2="6"></line>
					<line x1="3" y1="10" x2="21" y2="10"></line>
				</svg>
				تقویم شمسی
			</a>
		</div>
	</header>

	<!-- ── Tab navigation ────────────────────────────────────────── -->
	<nav class="tab-nav" aria-label="بخش‌های برنامه">
		<button
			class="tab-btn"
			class:active={activeTab === 'calendar'}
			onclick={() => (activeTab = 'calendar')}
			aria-current={activeTab === 'calendar' ? 'page' : undefined}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
				<line x1="16" y1="2" x2="16" y2="6"></line>
				<line x1="8" y1="2" x2="8" y2="6"></line>
				<line x1="3" y1="10" x2="21" y2="10"></line>
			</svg>
			تقویم
		</button>
		<button
			class="tab-btn"
			class:active={activeTab === 'converter'}
			onclick={() => (activeTab = 'converter')}
			aria-current={activeTab === 'converter' ? 'page' : undefined}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polyline points="17 1 21 5 17 9"></polyline>
				<path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
				<polyline points="7 23 3 19 7 15"></polyline>
				<path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
			</svg>
			تبدیل تاریخ
		</button>
	</nav>

	<!-- ── Main content ───────────────────────────────────────────── -->
	<main class="main-content">
		{#if activeTab === 'calendar'}
			<TodayBanner
				jalali={today.jalali}
				gregorian={today.gregorian}
				hijri={today.hijri}
				dayOfWeek={today.dayOfWeek}
			/>
			<CalendarGrid today={today.jalali} />
		{:else}
			<DateConverter {today} />
		{/if}
	</main>

	<!-- ── Footer ─────────────────────────────────────────────────── -->
	<footer class="site-footer">
		<span>تقویم شمسی · ساخته‌شده با SvelteKit</span>
	</footer>
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}

	/* ── Header ─────────────────── */
	.site-header {
		background: var(--color-primary);
		color: #fff;
		position: sticky;
		top: 0;
		z-index: 10;
		box-shadow: 0 1px 6px rgba(0, 0, 0, 0.15);
	}
	.header-inner {
		max-width: 900px;
		margin: 0 auto;
		padding: 0.85rem 1.25rem;
	}
	.logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: #fff;
		text-decoration: none;
		font-size: 1.15rem;
		font-weight: 700;
	}

	/* ── Tabs ───────────────────── */
	.tab-nav {
		display: flex;
		border-bottom: 2px solid var(--color-border);
		background: var(--color-surface);
		max-width: 900px;
		width: 100%;
		margin: 0 auto;
		padding: 0 1.25rem;
	}
	.tab-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		background: none;
		border: none;
		border-bottom: 3px solid transparent;
		margin-bottom: -2px;
		padding: 0.75rem 1rem;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--color-muted-text);
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
	}
	.tab-btn:hover {
		color: var(--color-primary);
	}
	.tab-btn.active {
		color: var(--color-primary);
		border-bottom-color: var(--color-primary);
	}

	/* ── Main ───────────────────── */
	.main-content {
		flex: 1;
		max-width: 900px;
		width: 100%;
		margin: 0 auto;
		padding: 1.5rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* ── Footer ─────────────────── */
	.site-footer {
		text-align: center;
		padding: 1rem;
		font-size: 0.8rem;
		color: var(--color-muted-text);
		border-top: 1px solid var(--color-border);
		background: var(--color-surface);
	}
</style>
