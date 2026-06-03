<template>
	<view class="page detail-page" :style="{ paddingTop: safeTop + 'px' }">
		<view class="topbar">
			<image class="back-icon" src="/static/icons/back.webp" mode="aspectFit" style="width: 64rpx; height: 64rpx; flex-shrink: 0;" @tap="goBack"></image>
			<text class="topbar-title">{{ t('detailTitle') }}</text>
			<view class="topbar-spacer"></view>
		</view>

		<view v-if="record" class="detail-card">
			<view class="detail-head">
				<view class="record-icon-shell" :style="{ background: accent.soft }">
					<image class="record-icon" :src="recordIcon" mode="aspectFit"></image>
				</view>
				<view class="detail-title-wrap">
					<text class="detail-title">{{ record.title }}</text>
					<view class="detail-meta-row">
						<text class="record-type-pill" :style="{ color: accent.strong, background: accent.soft }">{{ recordTypeLabel(record.type) }}</text>
						<text class="detail-time">{{ formatTime(record.createdAt) }}</text>
					</view>
				</view>
			</view>

			<view class="qr-panel">
				<QrPreview :content="record.content" />
			</view>

			<view class="content-panel">
				<view class="content-head">
					<text class="content-title">{{ t('rawContent') }}</text>
					<text class="content-source">{{ record.source === 'scanned' ? t('scannedSource') : t('generatedSource') }}</text>
				</view>
				<text class="content-text">{{ record.content }}</text>
			</view>

			<button class="primary-button" @tap="regenerate">{{ t('regenerate') }}</button>
			<view class="actions">
				<button class="ghost-button" @tap="copyContent">{{ t('copyContent') }}</button>
				<button class="ghost-button" @tap="toggleCurrentFavorite">{{ record.favorite ? t('unfavorite') : t('favorite') }}</button>
			</view>
			<button class="danger-button" @tap="removeRecord">{{ t('deleteRecord') }}</button>
		</view>

		<view v-else class="empty-card">
			<image class="empty-icon" src="/static/icons/records.webp" mode="aspectFit"></image>
			<text class="empty-title">{{ t('recordNotFound') }}</text>
			<text class="empty-desc">{{ t('recordNotFoundDesc') }}</text>
			<button class="primary-button" @tap="goRecords">{{ t('backRecords') }}</button>
		</view>
	</view>
</template>

<script lang="ts">
	import { deleteRecord, getRecord, toggleFavorite, type QrRecord } from '../../common/recordStore'
	import { recordTypeLabel, t } from '../../common/i18n'
	import QrPreview from '../../components/QrPreview.vue'

	export default {
		components: {
			QrPreview
		},
		data() {
			return {
				safeTop: 48,
				recordId: '',
				record: null as QrRecord | null
			}
		},
		onLoad(query: { id?: string }) {
			this.safeTop = this.getSafeTop()
			this.recordId = query && query.id ? decodeURIComponent(query.id) : ''
			this.loadRecord()
		},
		computed: {
			recordIcon() {
				const map = {
					WiFi: '/static/icons/wifi.webp',
					名片: '/static/icons/contact.webp',
					链接: '/static/icons/generate.webp',
					文本: '/static/icons/generate.webp',
					扫码: '/static/icons/scan.webp'
				}
				return this.record ? map[this.record.type] || '/static/icons/records.webp' : '/static/icons/records.webp'
			},
			accent() {
				const type = this.record ? this.record.type : '文本'
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
				return map[type] || map['文本']
			}
		},
		methods: {
			t,
			recordTypeLabel,
			getSafeTop() {
				const info = uni.getSystemInfoSync()
				return (info.statusBarHeight || 24) + 12
			},
			loadRecord() {
				this.record = this.recordId ? getRecord(this.recordId) || null : null
			},
			goBack() {
				uni.navigateBack({
					fail: () => {
						this.goRecords()
					}
				})
			},
			goRecords() {
				uni.reLaunch({
					url: '/pages/records/records'
				})
			},
			copyContent() {
				if (!this.record) {
					return
				}
				uni.setClipboardData({
					data: this.record.content
				})
			},
			regenerate() {
				if (!this.record) {
					return
				}
				uni.reLaunch({
					url: `/pages/generate/generate?content=${encodeURIComponent(this.record.content)}`
				})
			},
			toggleCurrentFavorite() {
				if (!this.record) {
					return
				}
				toggleFavorite(this.record.id)
				this.loadRecord()
			},
			removeRecord() {
				if (!this.record) {
					return
				}
				deleteRecord(this.record.id)
				uni.showToast({
					title: t('recordDeleted'),
					icon: 'success'
				})
				setTimeout(() => {
					this.goRecords()
				}, 500)
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
		color: #111827;
	}

	.page {
		min-height: 100vh;
		padding-right: 28rpx;
		padding-bottom: 56rpx;
		padding-left: 28rpx;
		box-sizing: border-box;
		background: #f8faf9;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.topbar,
	.detail-head,
	.detail-meta-row,
	.content-head,
	.actions {
		display: flex;
		align-items: center;
	}

	.topbar {
		height: 76rpx;
		justify-content: space-between;
	}

	.topbar-spacer,
	.back-icon {
		width: 64rpx;
		height: 64rpx;
	}

	.topbar-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #111827;
	}

	.detail-card,
	.empty-card {
		padding: 24rpx;
		border-radius: 20rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
		display: flex;
		flex-direction: column;
	}

	.detail-head {
		gap: 20rpx;
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
	}

	.detail-title-wrap {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.detail-title {
		font-size: 34rpx;
		font-weight: 750;
		line-height: 1.25;
		color: #111827;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.detail-meta-row {
		gap: 10rpx;
	}

	.record-type-pill {
		height: 34rpx;
		padding: 0 12rpx;
		border-radius: 10rpx;
		font-size: 22rpx;
		font-weight: 650;
		line-height: 34rpx;
	}

	.detail-time,
	.content-source {
		font-size: 24rpx;
		line-height: 1.35;
		color: #667085;
	}

	.qr-panel {
		margin-top: 28rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content-panel {
		margin-top: 28rpx;
		padding: 22rpx;
		border-radius: 16rpx;
		background: #f8fafc;
		border: 1rpx solid #edf2f7;
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.content-head {
		justify-content: space-between;
	}

	.content-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #111827;
	}

	.content-text {
		font-size: 26rpx;
		line-height: 1.5;
		color: #344054;
		word-break: break-all;
		white-space: pre-wrap;
	}

	.primary-button,
	.ghost-button,
	.danger-button {
		height: 82rpx;
		margin: 0;
		padding: 0;
		border-radius: 16rpx;
		font-size: 28rpx;
		font-weight: 650;
		line-height: 82rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.primary-button {
		margin-top: 24rpx;
		background: #075e59;
		color: #ffffff;
	}

	.actions {
		margin-top: 14rpx;
		gap: 14rpx;
	}

	.ghost-button {
		flex: 1;
		background: #ffffff;
		color: #0f766e;
		border: 2rpx solid #0f766e;
	}

	.danger-button {
		margin-top: 14rpx;
		background: #ffffff;
		color: #b42318;
		border: 2rpx solid #fecdca;
	}

	.primary-button::after,
	.primary-button::before,
	.ghost-button::after,
	.ghost-button::before,
	.danger-button::after,
	.danger-button::before {
		border: 0;
		background: transparent;
	}

	.empty-card {
		min-height: 520rpx;
		align-items: center;
		justify-content: center;
	}

	.empty-icon {
		width: 96rpx;
		height: 96rpx;
		opacity: 0.64;
	}

	.empty-title {
		margin-top: 22rpx;
		font-size: 30rpx;
		font-weight: 700;
		color: #111827;
	}

	.empty-desc {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #667085;
	}
</style>
