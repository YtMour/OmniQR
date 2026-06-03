<template>
	<view class="page" :style="{ paddingTop: safeTop + 'px' }">
		<view class="topbar">
			<image class="back-icon" src="/static/icons/back.webp" mode="aspectFit" style="width: 64rpx; height: 64rpx; flex-shrink: 0;" @tap="goBack"></image>
			<text class="topbar-title">{{ t('wifiTitle') }}</text>
			<view class="topbar-spacer"></view>
		</view>

		<view class="card">
			<text class="page-desc">{{ t('wifiDesc') }}</text>

			<view class="field">
				<text class="label">{{ t('wifiSsid') }}</text>
				<input class="input" v-model="ssid" :placeholder="t('wifiSsidExample')" @input="clearGenerated" />
			</view>

			<view class="field">
				<text class="label">{{ t('wifiPassword') }}</text>
				<input class="input" v-model="password" password :disabled="isNoPassword" :placeholder="isNoPassword ? t('wifiNoPasswordPlaceholder') : t('wifiPasswordPlaceholder')" @input="clearGenerated" />
			</view>

			<view class="field">
				<text class="label">{{ t('encryption') }}</text>
				<picker :range="encryptions" :value="encryptionIndex" @change="onEncryptionChange">
					<view class="picker">{{ encryptions[encryptionIndex] }}</view>
				</picker>
			</view>

			<view class="option-row">
				<view>
					<text class="label">{{ t('hiddenNetwork') }}</text>
					<text class="option-desc">{{ t('hiddenNetworkDesc') }}</text>
				</view>
				<switch :checked="hidden" color="#0f766e" @change="onHiddenChange" />
			</view>

			<view class="field">
				<text class="label">{{ t('recordTitle') }}</text>
				<input class="input" v-model="title" :placeholder="t('wifiTitleExample')" />
			</view>

			<view class="preview">
				<text class="preview-title">{{ t('contentPreview') }}</text>
				<text class="preview-text">{{ wifiPayload }}</text>
			</view>

			<view class="qr-stage">
				<QrPreview :content="generatedContent" :watermarkSeed="watermarkSeed" />
			</view>

			<button class="primary-button" @tap="submit">{{ t('generateWifiQr') }}</button>
			<view class="actions">
				<button class="ghost-button" :class="{ muted: !generatedContent }" @tap="saveQrImage">{{ t('saveQrImage') }}</button>
				<button class="ghost-button" :class="{ muted: !generatedContent }" @tap="copyContent">{{ t('copyContent') }}</button>
			</view>
		</view>
		<canvas :canvas-id="exportCanvasId" :id="exportCanvasId" class="export-canvas"></canvas>
	</view>
</template>

<script lang="ts">
	import { addRecord } from '../../common/recordStore'
	import { exportQrImage, QR_EXPORT_CANVAS_ID, saveQrImageToAlbum } from '../../common/qrExport'
	import { getSettings } from '../../common/settingsStore'
	import { t } from '../../common/i18n'
	import QrPreview from '../../components/QrPreview.vue'

	function escapeWifiValue(value: string) {
		return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/:/g, '\\:')
	}

	export default {
		components: {
			QrPreview
		},
		data() {
			return {
				safeTop: 48,
				ssid: '',
				password: '',
				encryptions: ['WPA/WPA2', 'WEP', t('noPassword')],
				encryptionIndex: 0,
				hidden: false,
				title: '',
				generatedContent: '',
				watermarkSeed: '',
				exportCanvasId: QR_EXPORT_CANVAS_ID
			}
		},
		onLoad() {
			this.safeTop = this.getSafeTop()
		},
		computed: {
			isNoPassword() {
				return this.encryptionIndex === 2
			},
			wifiPayload() {
				const type = this.isNoPassword ? 'nopass' : this.encryptions[this.encryptionIndex].replace('/WPA2', '')
				const ssid = escapeWifiValue(this.ssid.trim() || t('wifiDefaultName'))
				const password = this.isNoPassword ? '' : escapeWifiValue(this.password)
				return `WIFI:T:${type};S:${ssid};P:${password};H:${this.hidden ? 'true' : 'false'};;`
			}
		},
		methods: {
			t,
			clearGenerated() {
				this.generatedContent = ''
			},
			getSafeTop() {
				const info = uni.getSystemInfoSync()
				return (info.statusBarHeight || 24) + 12
			},
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}
				})
			},
			onEncryptionChange(event: { detail: { value: string | number } }) {
				this.encryptionIndex = Number(event.detail.value)
				if (this.isNoPassword) {
					this.password = ''
				}
				this.clearGenerated()
			},
			onHiddenChange(event: { detail: { value: boolean } }) {
				this.hidden = event.detail.value
				this.clearGenerated()
			},
			submit() {
				if (!this.ssid.trim()) {
					uni.showToast({
						title: t('inputWifiName'),
						icon: 'none'
					})
					return
				}
				if (!this.isNoPassword && !this.password.trim()) {
					uni.showToast({
						title: t('inputWifiPassword'),
						icon: 'none'
					})
					return
				}
				this.generatedContent = this.wifiPayload
				this.watermarkSeed = `${this.generatedContent}-${Date.now()}`
				this.saveRecord(false)
				uni.showToast({
					title: t('qrGenerated'),
					icon: 'success'
				})
			},
			saveRecord(showToast = true) {
				if (!this.generatedContent) {
					uni.showToast({
						title: t('generateFirst'),
						icon: 'none'
					})
					return
				}
				const settings = getSettings()
				addRecord({
					title: this.title.trim() || settings.defaultRecordTitle || this.ssid.trim() || t('wifiDefaultTitle'),
					type: 'WiFi',
					content: this.generatedContent,
					desc: `${this.ssid.trim()} · ${this.encryptions[this.encryptionIndex]}${this.hidden ? ` · ${t('hiddenNetwork')}` : ''}`
				})
				if (showToast) {
						uni.showToast({
							title: t('savedRecord'),
						icon: 'success'
					})
				}
			},
			copyContent() {
				if (!this.generatedContent) {
					uni.showToast({
						title: t('generateFirst'),
						icon: 'none'
					})
					return
				}
				uni.setClipboardData({
					data: this.generatedContent
				})
			},
			saveQrImage() {
				if (!this.generatedContent) {
					uni.showToast({
						title: t('generateFirst'),
						icon: 'none'
					})
					return
				}
				saveQrImageToAlbum(this.generatedContent, this)
					.then(() => {
						uni.showToast({
							title: t('savedAlbum'),
							icon: 'success'
						})
					})
					.catch(() => {
						if (getSettings().previewImageOnSaveFail) {
							this.previewExportedImage()
							return
						}
						uni.showToast({
							title: t('saveImageFailed'),
							icon: 'none'
						})
					})
			},
			previewExportedImage() {
				exportQrImage(this.generatedContent, this)
					.then((tempFilePath: string) => {
						uni.previewImage({
							urls: [tempFilePath],
							current: tempFilePath
						})
					})
					.catch(() => {
						uni.showToast({
							title: t('saveImageFailed'),
							icon: 'none'
						})
					})
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
		padding-bottom: 48rpx;
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

	.back-icon {
		width: 64rpx;
		height: 64rpx;
	}

	.topbar-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #111827;
	}

	.card {
		padding: 28rpx;
		border-radius: 18rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.page-desc,
	.preview-text {
		font-size: 26rpx;
		line-height: 1.5;
		color: #667085;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.option-row {
		min-height: 96rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}

	.option-desc {
		display: block;
		margin-top: 8rpx;
		font-size: 24rpx;
		line-height: 1.35;
		color: #667085;
	}

	.label,
	.preview-title {
		font-size: 28rpx;
		font-weight: 650;
		color: #18202c;
	}

	.input,
	.picker {
		height: 84rpx;
		padding: 0 22rpx;
		border-radius: 14rpx;
		border: 1rpx solid #b8c4d0;
		font-size: 28rpx;
		line-height: 84rpx;
		box-sizing: border-box;
	}

	.input[disabled] {
		color: #98a2b3;
		background: #f8fafc;
	}

	.preview {
		padding: 22rpx;
		border-radius: 14rpx;
		background: #f9fafb;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		border: 1rpx solid #edf2f7;
	}

	.qr-stage {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.primary-button {
		height: 84rpx;
		border-radius: 14rpx;
		background: #075e59;
		color: #ffffff;
		font-size: 28rpx;
		line-height: 84rpx;
		overflow: hidden;
	}

	.actions {
		display: flex;
		gap: 14rpx;
	}

	.ghost-button {
		flex: 1;
		height: 74rpx;
		margin: 0;
		padding: 0;
		border-radius: 14rpx;
		background: #ffffff;
		border: 2rpx solid #0f766e;
		color: #0f766e;
		font-size: 26rpx;
		line-height: 74rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.ghost-button.muted {
		color: #98a2b3;
		border-color: #d7dee8;
	}

	.full-button {
		width: 100%;
	}

	.export-canvas {
		position: fixed;
		left: -9999px;
		top: -9999px;
		width: 720px;
		height: 720px;
		pointer-events: none;
	}

	.primary-button::after,
	.primary-button::before,
	.ghost-button::after,
	.ghost-button::before {
		border: 0;
		background: transparent;
	}
</style>
