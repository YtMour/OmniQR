<template>
	<view class="page" :style="{ paddingTop: safeTop + 'px' }">
		<view class="topbar">
			<view class="topbar-spacer"></view>
			<text class="topbar-title">{{ t('recordsTitle') }}</text>
			<view class="topbar-spacer"></view>
		</view>

		<view class="search-box">
			<input class="search-input" v-model="keyword" :placeholder="t('searchRecords')" />
		</view>

		<view class="tabs">
			<view v-for="tab in tabs" :key="tab.id" class="tab" :class="{ active: activeTab === tab.id }" @tap="activeTab = tab.id">
				{{ tabLabel(tab) }}
			</view>
		</view>

		<view class="records-summary">
			<text class="records-summary-main">{{ filteredRecords.length }} {{ t('recordCountSuffix') }}</text>
			<text class="records-summary-sub">{{ favoriteCount }} {{ t('favoriteCountSuffix') }}</text>
		</view>

		<view v-if="filteredRecords.length" class="record-list">
			<view v-for="record in filteredRecords" :key="record.id" class="record-card" @tap="openRecord(record)">
				<view class="record-icon-shell" :style="{ background: getRecordAccent(record).soft }">
					<image class="record-icon" :src="getRecordIcon(record)" mode="aspectFit" style="width: 64rpx; height: 64rpx; flex-shrink: 0;"></image>
				</view>
				<view class="record-main">
					<text class="record-title">{{ record.title }}</text>
					<view class="record-meta-row">
						<text class="record-type-pill" :style="{ color: getRecordAccent(record).strong, background: getRecordAccent(record).soft }">{{ recordTypeLabel(record.type) }}</text>
						<text class="record-time">{{ record.time }}</text>
					</view>
					<text class="record-desc">{{ record.desc }}</text>
				</view>
				<image class="star" :src="record.favorite ? '/static/icons/star-filled.webp' : '/static/icons/star-outline.webp'" mode="aspectFit" style="width: 42rpx; height: 42rpx; flex-shrink: 0;" @tap.stop="toggleRecordFavorite(record)"></image>
			</view>
		</view>
		<view v-else class="records-empty">
			<image class="records-empty-icon" src="/static/icons/records.webp" mode="aspectFit"></image>
			<text class="records-empty-title">{{ keyword || activeTab !== 'all' ? t('noMatchedRecords') : t('noScanRecords') }}</text>
			<text class="records-empty-desc">{{ keyword || activeTab !== 'all' ? t('noMatchedDesc') : t('recordsEmptyDesc') }}</text>
		</view>

		<AppTabBar active="records" />
	</view>
</template>

<script lang="ts">
	import { listRecords, toggleFavorite, type QrRecord } from '../../common/recordStore'
	import { recordTypeLabel, t } from '../../common/i18n'
	import AppTabBar from '../../components/AppTabBar.vue'

	export default {
		components: {
			AppTabBar
		},
		data() {
			return {
				safeTop: 48,
				keyword: '',
				favoriteTapped: false,
				activeTab: 'all',
				tabs: [
					{ id: 'all', type: '' },
					{ id: 'favorite', type: '' },
					{ id: 'wifi', type: 'WiFi' },
					{ id: 'contact', type: '名片' },
					{ id: 'link', type: '链接' }
				],
				records: []
			}
		},
		onLoad() {
			this.safeTop = this.getSafeTop()
		},
		onShow() {
			this.records = listRecords().map((record) => ({
				...record,
				time: this.formatTime(record.createdAt)
			}))
		},
		computed: {
			filteredRecords() {
				return this.records.filter((record) => {
					const active = this.tabs.find((tab) => tab.id === this.activeTab)
					const matchTab = !active || active.id === 'all' || (active.id === 'favorite' ? record.favorite : record.type === active.type)
					const text = `${record.title} ${record.desc} ${record.type}`
					const matchKeyword = !this.keyword || text.toLowerCase().includes(this.keyword.toLowerCase())
					return matchTab && matchKeyword
				})
			},
			favoriteCount() {
				return this.records.filter((record) => record.favorite).length
			}
		},
		methods: {
			t,
			recordTypeLabel,
			tabLabel(tab) {
				if (tab.id === 'all') return t('all')
				if (tab.id === 'favorite') return t('favorite')
				return recordTypeLabel(tab.type)
			},
			getSafeTop() {
				const info = uni.getSystemInfoSync()
				return (info.statusBarHeight || 24) + 12
			},
			goTab(url) {
				uni.reLaunch({
					url
				})
			},
			getRecordIcon(record: QrRecord) {
				const map = {
					WiFi: '/static/icons/wifi.webp',
					名片: '/static/icons/contact.webp',
					链接: '/static/icons/generate.webp',
					文本: '/static/icons/generate.webp',
					扫码: '/static/icons/scan.webp'
				}
				return map[record.type] || '/static/icons/records.webp'
			},
			getRecordAccent(record: QrRecord) {
				const map = {
					WiFi: {
						soft: '#ecfdf5',
						strong: '#047857'
					},
					名片: {
						soft: '#ecfeff',
						strong: '#0e7490'
					},
					链接: {
						soft: '#eff6ff',
						strong: '#2563eb'
					},
					文本: {
						soft: '#f8fafc',
						strong: '#475467'
					},
					扫码: {
						soft: '#fff7ed',
						strong: '#c2410c'
					}
				}
				return map[record.type] || map['文本']
			},
			openRecord(record: QrRecord) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${encodeURIComponent(record.id)}`
				})
			},
			toggleRecordFavorite(record: QrRecord) {
				this.records = toggleFavorite(record.id).map((item) => ({
					...item,
					time: this.formatTime(item.createdAt)
				}))
			},
			formatTime(timestamp: number) {
				if (!timestamp) {
					return ''
				}
				const date = new Date(timestamp)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const hour = String(date.getHours()).padStart(2, '0')
				const minute = String(date.getMinutes()).padStart(2, '0')
				return `${year}-${month}-${day} ${hour}:${minute}`
			}
		}
	}
</script>

<style>
	page {
		background: #f8faf9;
	}

	.page {
		min-height: 100vh;
		padding-right: 28rpx;
		padding-bottom: 224rpx;
		padding-left: 28rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		background: #f8faf9;
	}

	.topbar {
		height: 76rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.topbar-spacer {
		width: 64rpx;
	}

	.topbar-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #111827;
	}

	.search-box {
		padding: 0 22rpx;
		border-radius: 16rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.search-input {
		height: 84rpx;
		font-size: 28rpx;
	}

	.tabs {
		display: flex;
		gap: 14rpx;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.tabs::-webkit-scrollbar {
		display: none;
	}

	.tab {
		flex-shrink: 0;
		min-width: 92rpx;
		height: 60rpx;
		padding: 0 22rpx;
		border-radius: 30rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		font-size: 26rpx;
		line-height: 60rpx;
		text-align: center;
		color: #475467;
		box-sizing: border-box;
	}

	.tab.active {
		background: #0f766e;
		border-color: #0f766e;
		color: #ffffff;
	}

	.records-summary {
		margin-top: -8rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.records-summary-main,
	.records-summary-sub {
		font-size: 24rpx;
		line-height: 1.35;
		color: #667085;
	}

	.records-summary-main {
		font-weight: 650;
		color: #344054;
	}

	.record-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		border: 0;
		border-radius: 0;
		background: transparent;
		overflow: visible;
		box-shadow: none;
	}

	.record-card {
		min-height: 150rpx;
		padding: 26rpx 24rpx;
		border-radius: 18rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		display: flex;
		align-items: center;
		gap: 20rpx;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.record-card:active {
		opacity: 0.82;
	}

	.record-icon-shell {
		width: 88rpx;
		height: 88rpx;
		border-radius: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.record-icon {
		width: 64rpx;
		height: 64rpx;
		border-radius: 20rpx;
	}

	.record-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.record-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #111827;
		line-height: 1.25;
	}

	.record-meta-row {
		display: flex;
		align-items: center;
		gap: 10rpx;
		min-width: 0;
	}

	.record-type-pill {
		flex-shrink: 0;
		height: 34rpx;
		padding: 0 12rpx;
		border-radius: 10rpx;
		font-size: 22rpx;
		font-weight: 650;
		line-height: 34rpx;
	}

	.record-time,
	.record-desc {
		font-size: 24rpx;
		line-height: 1.35;
		color: #667085;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.record-time {
		min-width: 0;
		flex: 1;
	}

	.star {
		width: 36rpx;
		height: 36rpx;
		opacity: 0.32;
	}

	.records-empty {
		min-height: 420rpx;
		padding: 48rpx 32rpx;
		border-radius: 18rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.records-empty-icon {
		width: 92rpx;
		height: 92rpx;
		opacity: 0.64;
	}

	.records-empty-title {
		margin-top: 22rpx;
		font-size: 30rpx;
		font-weight: 700;
		color: #111827;
	}

	.records-empty-desc {
		margin-top: 8rpx;
		font-size: 24rpx;
		line-height: 1.45;
		color: #667085;
		text-align: center;
	}

	.star.active {
		opacity: 0.85;
	}

	.bottom-nav {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 112rpx;
		padding-bottom: env(safe-area-inset-bottom);
		background: #ffffff;
		border-top: 1rpx solid #d7dee8;
		display: flex;
		align-items: center;
		justify-content: space-around;
		z-index: 20;
	}

	.nav-item {
		width: 140rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4rpx;
		color: #667085;
	}

	.nav-item.active {
		color: #064e4a;
	}

	.nav-icon {
		width: 42rpx;
		height: 42rpx;
		opacity: 0.58;
	}

	.nav-item.active .nav-icon {
		opacity: 1;
	}

	.nav-text {
		font-size: 22rpx;
		line-height: 1.2;
	}
</style>
