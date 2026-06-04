<template>
	<view class="page" :style="{ paddingTop: safeTop + 'px' }">
		<view class="app-header" style="display: flex; align-items: center; justify-content: space-between;">
			<view class="brand-wrap" style="display: flex; align-items: center; min-width: 0;">
				<image class="brand-icon" src="/static/brand/omniqr-icon.webp" mode="aspectFit" style="width: 88rpx; height: 88rpx; border-radius: 22rpx; flex-shrink: 0;"></image>
				<view class="brand" style="display: flex; flex-direction: column; margin-left: 18rpx; min-width: 0;">
					<text class="brand-name" style="display: block; font-size: 54rpx; font-weight: 800; line-height: 1.18; color: #064e4a;">OmniQR</text>
					<text class="brand-title" style="display: block; margin-top: 6rpx; font-size: 28rpx; line-height: 1.2; color: #0f172a;">{{ t('appSubtitle') }}</text>
				</view>
			</view>
			<view class="settings-button" style="width: 72rpx; height: 72rpx; display: flex; align-items: center; justify-content: center; border-radius: 36rpx; background: #ffffff; border: 1rpx solid #d7dee8;" @tap="navigateTo('/pages/settings/settings')">
				<image class="settings-icon" src="/static/icons/settings.webp" mode="aspectFit" style="width: 42rpx; height: 42rpx;"></image>
			</view>
		</view>

		<view class="tool-grid" style="display: flex; flex-wrap: wrap; justify-content: space-between;">
			<view v-for="tool in primaryTools" :key="tool.titleKey" class="tool-card" style="width: 48%; height: 192rpx; margin-bottom: 20rpx; padding: 20rpx; box-sizing: border-box; border-radius: 16rpx; background: #ffffff; border: 1rpx solid #d7dee8; display: flex; flex-direction: column; align-items: center; justify-content: center;" @tap="handleTool(tool)">
				<view class="tool-icon-shell" style="width: 88rpx; height: 88rpx; display: flex; align-items: center; justify-content: center; border-radius: 24rpx; background: #ecfdf5;">
					<image class="tool-image" :src="tool.icon" mode="aspectFit" style="width: 68rpx; height: 68rpx;"></image>
				</view>
				<text class="tool-title" style="display: block; margin-top: 14rpx; font-size: 28rpx; font-weight: 600; line-height: 1.35; color: #111827; text-align: center;">{{ t(tool.titleKey) }}</text>
			</view>
			<view class="records-entry" style="width: 100%; height: 108rpx; padding: 18rpx 24rpx; box-sizing: border-box; border-radius: 16rpx; background: #ffffff; border: 1rpx solid #d7dee8; display: flex; align-items: center; justify-content: flex-start;" @tap="goTab('/pages/records/records')">
				<view class="history-icon-shell" style="width: 76rpx; height: 76rpx; display: flex; align-items: center; justify-content: center; border-radius: 22rpx; background: #ecfdf5;">
					<image class="history-image" src="/static/icons/history.webp" mode="aspectFit" style="width: 58rpx; height: 58rpx;"></image>
				</view>
				<text class="tool-title" style="display: block; margin-left: 18rpx; font-size: 28rpx; font-weight: 650; color: #111827;">{{ t('scanRecords') }}</text>
			</view>
			<view class="records-entry" style="width: 100%; height: 108rpx; padding: 18rpx 24rpx; box-sizing: border-box; border-radius: 16rpx; background: #ffffff; border: 1rpx solid #d7dee8; display: flex; align-items: center; justify-content: flex-start;" @tap="scanFromAlbum">
				<view class="history-icon-shell" style="width: 76rpx; height: 76rpx; display: flex; align-items: center; justify-content: center; border-radius: 22rpx; background: #ecfdf5;">
					<image class="history-image" src="/static/icons/scan.webp" mode="aspectFit" style="width: 58rpx; height: 58rpx;"></image>
				</view>
				<text class="tool-title" style="display: block; margin-left: 18rpx; font-size: 28rpx; font-weight: 650; color: #111827;">{{ t('scanFromAlbum') }}</text>
			</view>
		</view>

		<view class="records-section" style="display: flex; flex-direction: column;">
			<view class="section-head" style="display: flex; align-items: center; justify-content: space-between;">
				<text class="section-title" style="font-size: 30rpx; font-weight: 600; color: #111827;">{{ t('recentRecords') }}</text>
				<text class="section-more" style="font-size: 24rpx; color: #0f766e;" @tap="goTab('/pages/records/records')">{{ t('viewMore') }}</text>
			</view>
			<view v-if="records.length" class="home-record-list" style="margin-top: 16rpx; display: flex; flex-direction: column;">
				<view v-for="record in records" :key="record.id" class="record-item home-record-card" style="min-height: 112rpx; padding: 20rpx; border: 1rpx solid #d7dee8; border-radius: 18rpx; background: #ffffff; display: flex; align-items: center; box-sizing: border-box;" @tap="openRecord(record)">
					<view class="record-icon-shell" :style="{ background: getRecordAccent(record).soft }">
						<image class="record-icon" :src="record.icon" mode="aspectFit" style="width: 58rpx; height: 58rpx; flex-shrink: 0;"></image>
					</view>
					<view class="record-content" style="flex: 1; min-width: 0; margin-left: 18rpx; display: flex; flex-direction: column;">
						<text class="record-title" style="font-size: 28rpx; font-weight: 600; line-height: 1.35; color: #111827;">{{ record.title }}</text>
						<view class="record-meta-row">
							<text class="record-type-pill" :style="{ color: getRecordAccent(record).strong, background: getRecordAccent(record).soft }">{{ recordTypeLabel(record.type) }}</text>
							<text class="record-time">{{ record.time }}</text>
						</view>
						<text class="record-desc" style="margin-top: 4rpx; font-size: 22rpx; line-height: 1.35; color: #667085; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ record.desc }}</text>
					</view>
					<image class="record-star" src="/static/icons/star-outline.webp" mode="aspectFit" style="width: 36rpx; height: 36rpx; margin-left: 14rpx; opacity: 0.42; flex-shrink: 0;"></image>
				</view>
			</view>
			<view v-else class="empty-card" style="margin-top: 16rpx; min-height: 156rpx; padding: 28rpx; border-radius: 16rpx; background: #ffffff; border: 1rpx solid #d7dee8; display: flex; align-items: center;">
				<view class="empty-icon-shell" style="width: 76rpx; height: 76rpx; border-radius: 22rpx; background: #ecfdf5; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
					<image src="/static/icons/records.webp" mode="aspectFit" style="width: 50rpx; height: 50rpx; opacity: 0.72;"></image>
				</view>
				<view style="margin-left: 20rpx; min-width: 0;">
					<text style="display: block; font-size: 28rpx; font-weight: 650; color: #111827;">{{ t('noRecords') }}</text>
					<text style="display: block; margin-top: 6rpx; font-size: 24rpx; line-height: 1.4; color: #667085;">{{ t('noRecordsDesc') }}</text>
				</view>
			</view>
		</view>

		<AppTabBar active="home" />
	</view>
</template>

<script lang="ts">
	import { addRecord, detectRecordType, listRecords, type QrRecord } from '../../common/recordStore'
	import { recordTypeLabel, t } from '../../common/i18n'
	import AppTabBar from '../../components/AppTabBar.vue'

	export default {
		components: {
			AppTabBar
		},
		data() {
			return {
				safeTop: 48,
				primaryTools: [
					{
						titleKey: 'scan',
						icon: '/static/icons/scan.webp',
						action: 'scan'
					},
					{
						titleKey: 'qrGenerate',
						icon: '/static/icons/generate.webp',
						path: '/pages/generate/generate'
					},
					{
						titleKey: 'wifiQr',
						icon: '/static/icons/wifi.webp',
						path: '/pages/wifi/wifi'
					},
					{
						titleKey: 'contactQr',
						icon: '/static/icons/contact.webp',
						path: '/pages/contact/contact'
					}
				],
				records: []
			}
		},
		onLoad() {
			this.safeTop = this.getSafeTop()
		},
		onShow() {
			this.records = listRecords().slice(0, 2).map(this.formatRecord)
		},
		methods: {
			t,
			getSafeTop() {
				const info = uni.getSystemInfoSync()
				return (info.statusBarHeight || 24) + 18
			},
			handleTool(tool) {
				if (tool.action === 'scan') {
					this.scanCode()
					return
				}
				if (tool.path === '/pages/generate/generate') {
					this.goTab(tool.path)
					return
				}
				this.navigateTo(tool.path)
			},
			goTab(url) {
				uni.reLaunch({
					url
				})
			},
			navigateTo(url) {
				uni.navigateTo({
					url
				})
			},
			scanCode() {
				uni.scanCode({
					success: (res) => {
						this.handleScanResult(res.result || '')
					},
					fail: () => {
						uni.showToast({
							title: t('scanUnavailable'),
							icon: 'none'
						})
					}
				})
			},
			scanFromAlbum() {
				uni.scanCode({
					onlyFromCamera: false,
					success: (res) => {
						this.handleScanResult(res.result || '')
					},
					fail: () => {
						uni.showToast({
							title: t('albumScanUnavailable'),
							icon: 'none'
						})
					}
				})
			},
			handleScanResult(content: string) {
				if (!content.trim()) {
					uni.showToast({
						title: t('scanNoContent'),
						icon: 'none'
					})
					return
				}
				const type = detectRecordType(content)
				if (type === '链接') {
					uni.showModal({
						title: t('linkSafetyTitle'),
						content: `${t('linkSafetyContent')}\n${content}`,
						confirmText: t('saveAndView'),
						cancelText: t('cancel'),
						success: (res) => {
							if (res.confirm) {
								this.saveScannedRecord(content, type)
							}
						}
					})
					return
				}
				this.saveScannedRecord(content, type)
			},
			saveScannedRecord(content: string, type: string) {
				const record = addRecord({
					title: type === '链接' ? t('scanLink') : t('scanResult'),
					type: type as any,
					content,
					desc: content.length > 32 ? `${content.slice(0, 32)}...` : content,
					source: 'scanned'
				})
				uni.navigateTo({
					url: `/pages/detail/detail?id=${encodeURIComponent(record.id)}`
				})
			},
			openRecord(record: QrRecord) {
				uni.navigateTo({
					url: `/pages/detail/detail?id=${encodeURIComponent(record.id)}`
				})
			},
			formatRecord(record: QrRecord) {
				const map = {
					WiFi: {
						icon: '/static/icons/wifi.webp'
					},
					名片: {
						icon: '/static/icons/contact.webp'
					},
					链接: {
						icon: '/static/icons/generate.webp'
					},
					文本: {
						icon: '/static/icons/generate.webp'
					}
				}
				const meta = map[record.type as keyof typeof map] || map['链接']
				return {
					...record,
					...meta,
					time: this.formatTime(record.createdAt)
				}
			},
			recordTypeLabel,
			getRecordAccent(record) {
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
					}
				}
				return map[record.type] || map['文本']
			},
			formatTime(timestamp: number) {
				if (!timestamp) {
					return ''
				}
				const diff = Date.now() - timestamp
				if (diff < 1000 * 60 * 60) {
					return t('justNow')
				}
				if (diff < 1000 * 60 * 60 * 24) {
					const date = new Date(timestamp)
					return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
				}
				return t('yesterday')
			}
		}
	}
</script>

<style>
	page {
		background: #f8faf9;
		color: #18202c;
	}

	.page {
		min-height: 100vh;
		padding-right: 28rpx;
		padding-bottom: 224rpx;
		padding-left: 28rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: 22rpx;
		background: #f8faf9;
	}

	.app-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24rpx;
	}

	.brand-wrap {
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 18rpx;
	}

	.brand-icon {
		width: 88rpx;
		height: 88rpx;
		border-radius: 22rpx;
		flex-shrink: 0;
	}

	.brand {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.brand-name {
		display: block;
		font-size: 54rpx;
		font-weight: 800;
		line-height: 1.18;
		color: #064e4a;
	}

	.brand-title {
		display: block;
		font-size: 28rpx;
		font-weight: 500;
		line-height: 1.2;
		color: #0f172a;
	}

	.settings-button {
		width: 68rpx;
		height: 68rpx;
		border-radius: 34rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
	}

	.settings-icon {
		width: 42rpx;
		height: 42rpx;
	}

	.tool-card:active,
	.records-entry:active,
	.record-item:active,
	.nav-item:active,
	.settings-button:active {
		opacity: 0.82;
	}

	.tool-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		margin-top: 4rpx;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #111827;
	}

	.section-more {
		font-size: 24rpx;
		color: #0f766e;
	}

	.tool-card {
		width: 48%;
		height: 192rpx;
		margin-bottom: 20rpx;
		padding: 20rpx;
		box-sizing: border-box;
		border-radius: 16rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 14rpx;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.records-entry {
		width: 100%;
		height: 108rpx;
		padding: 18rpx 24rpx;
		box-sizing: border-box;
		border-radius: 16rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 20rpx;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.tool-icon-shell {
		width: 88rpx;
		height: 88rpx;
		border-radius: 24rpx;
		background: #ecfdf5;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tool-image {
		width: 68rpx;
		height: 68rpx;
	}

	.history-icon-shell {
		width: 88rpx;
		height: 88rpx;
		border-radius: 24rpx;
		background: #ecfdf5;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.history-image {
		width: 68rpx;
		height: 68rpx;
	}

	.tool-title {
		font-size: 28rpx;
		font-weight: 600;
		line-height: 1.35;
		color: #111827;
	}

	.records-section {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.record-list {
		border-radius: 16rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.home-record-list {
		gap: 16rpx;
	}

	.record-item {
		min-height: 112rpx;
		padding: 20rpx;
		display: flex;
		align-items: center;
		gap: 18rpx;
	}

	.home-record-card {
		border-radius: 18rpx;
		border: 1rpx solid #d7dee8;
		background: #ffffff;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.record-icon-shell {
		width: 80rpx;
		height: 80rpx;
		border-radius: 26rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.record-icon {
		width: 58rpx;
		height: 58rpx;
		border-radius: 18rpx;
	}

	.record-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.record-title {
		font-size: 28rpx;
		font-weight: 600;
		line-height: 1.35;
		color: #111827;
	}

	.record-type-text {
		font-size: 22rpx;
		line-height: 1.25;
		color: #0f766e;
	}

	.record-meta-row {
		margin-top: 4rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		min-width: 0;
	}

	.record-type-pill {
		flex-shrink: 0;
		height: 32rpx;
		padding: 0 10rpx;
		border-radius: 10rpx;
		font-size: 20rpx;
		font-weight: 650;
		line-height: 32rpx;
	}

	.record-time {
		min-width: 0;
		flex: 1;
		font-size: 22rpx;
		line-height: 1.3;
		color: #667085;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.record-desc {
		font-size: 22rpx;
		line-height: 1.35;
		color: #667085;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.record-star {
		width: 36rpx;
		height: 36rpx;
		opacity: 0.42;
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
