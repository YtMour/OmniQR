<template>
	<view class="page generate-page" :style="{ paddingTop: safeTop + 'px' }">
		<view class="topbar" style="height: 72rpx; display: flex; align-items: center; justify-content: space-between;">
			<image class="back-icon" src="/static/icons/back.webp" mode="aspectFit" style="width: 64rpx; height: 64rpx; flex-shrink: 0;" @tap="goTab('/pages/index/index')"></image>
			<text class="topbar-title" style="font-size: 36rpx; font-weight: 700; line-height: 1.2; color: #111827;">{{ t('generateQr') }}</text>
			<view class="topbar-spacer" style="width: 64rpx; height: 64rpx;"></view>
		</view>

		<view class="form-card compact-card" style="margin-top: 14rpx; padding: 22rpx; border-radius: 20rpx; background: #ffffff; border: 1rpx solid #d7dee8;">
			<view class="segmented" style="display: flex; padding: 6rpx; border-radius: 18rpx; background: #f1f5f9;">
				<view v-for="(type, index) in types" :key="type.key" class="segment-item" :class="{ active: typeIndex === index }" :style="getSegmentStyle(index)" @tap="typeIndex = index">
					<text class="segment-text" :style="{ color: typeIndex === index ? '#ffffff' : '#475467' }">{{ t(type.key) }}</text>
				</view>
			</view>

			<view class="field" style="margin-top: 20rpx; display: flex; flex-direction: column;">
				<view class="field-head" style="display: flex; align-items: center; justify-content: space-between;">
					<text class="label" style="font-size: 28rpx; font-weight: 650; color: #18202c;">{{ t('qrContent') }}</text>
					<text class="field-count" style="font-size: 22rpx; color: #98a2b3;">{{ content.length }}/1000</text>
				</view>
				<textarea class="textarea content-textarea" v-model="content" maxlength="1000" :placeholder="t('enterQrContent')" style="width: 100%; height: 168rpx; margin-top: 10rpx; padding: 20rpx; border-radius: 16rpx; border: 1rpx solid #b8c4d0; background: #ffffff; font-size: 28rpx; line-height: 1.45; box-sizing: border-box;" @input="onContentInput" />
			</view>

			<view class="field" style="margin-top: 16rpx; display: flex; flex-direction: column;">
				<text class="label" style="font-size: 28rpx; font-weight: 650; color: #18202c;">{{ t('recordTitle') }}</text>
				<input class="input" v-model="title" :placeholder="t('recordTitleExample')" style="height: 74rpx; margin-top: 10rpx; padding: 0 20rpx; border-radius: 16rpx; border: 1rpx solid #b8c4d0; background: #ffffff; font-size: 28rpx; line-height: 74rpx; box-sizing: border-box;" />
			</view>
		</view>

		<view class="preview-card compact-card" style="margin-top: 18rpx; padding: 22rpx; border-radius: 20rpx; background: #ffffff; border: 1rpx solid #d7dee8;">
			<view class="preview-head" style="display: flex; align-items: center; justify-content: space-between;">
				<text class="section-title" style="font-size: 30rpx; font-weight: 700; color: #111827;">{{ t('qrPreview') }}</text>
				<text class="preview-status" :class="{ ready: generatedContent }" style="font-size: 22rpx;">{{ generatedContent ? t('generated') : content.trim() ? t('pendingGenerate') : t('waitingInput') }}</text>
			</view>
			<view class="qr-stage" style="margin-top: 14rpx; display: flex; align-items: center; justify-content: center;">
				<QrPreview :content="generatedContent" :watermarkSeed="watermarkSeed" />
			</view>
			<button class="primary-button" :class="{ muted: !content.trim() }" style="width: 100%; height: 82rpx; margin: 18rpx 0 0; padding: 0; border: 0; border-radius: 16rpx; color: #ffffff; font-size: 30rpx; font-weight: 650; line-height: 82rpx; box-sizing: border-box; overflow: hidden;" @tap="handleGenerate">{{ t('generate') }}</button>
			<view class="actions" style="display: flex; margin-top: 14rpx;">
				<button class="ghost-button" :class="{ muted: !generatedContent }" style="flex: 1; height: 72rpx; margin: 0 8rpx 0 0; padding: 0; border-radius: 16rpx; background: #ffffff; font-size: 26rpx; line-height: 72rpx; box-sizing: border-box; overflow: hidden;" @tap="saveQrImage">{{ t('saveQrImage') }}</button>
				<button class="ghost-button" :class="{ muted: !generatedContent }" style="flex: 1; height: 72rpx; margin: 0 0 0 8rpx; padding: 0; border-radius: 16rpx; background: #ffffff; font-size: 26rpx; line-height: 72rpx; box-sizing: border-box; overflow: hidden;" @tap="copyContent">{{ t('copyContent') }}</button>
			</view>
		</view>

		<canvas :canvas-id="exportCanvasId" :id="exportCanvasId" class="export-canvas"></canvas>
		<AppTabBar active="generate" />
	</view>
</template>

<script lang="ts">
	import { addRecord, type RecordType } from '../../common/recordStore'
	import { downloadQrImageFile, exportQrPreviewImage, QR_EXPORT_CANVAS_ID, saveQrImageToAlbum } from '../../common/qrExport'
	import { getSettings } from '../../common/settingsStore'
	import { t } from '../../common/i18n'
	import AppTabBar from '../../components/AppTabBar.vue'
	import QrPreview from '../../components/QrPreview.vue'

	export default {
		components: {
			AppTabBar,
			QrPreview
		},
		data() {
			return {
				safeTop: 48,
				types: [
					{ key: 'link', recordType: '链接' },
					{ key: 'text', recordType: '文本' },
					{ key: 'customContent', recordType: '文本' }
				],
				typeIndex: 0,
				content: '',
				title: '',
				generatedContent: '',
				watermarkSeed: '',
				exportCanvasId: QR_EXPORT_CANVAS_ID
			}
		},
		onLoad(query: { content?: string; source?: string }) {
			this.safeTop = this.getSafeTop()
			if (query && query.content) {
				this.content = decodeURIComponent(query.content)
				this.generatedContent = ''
			}
			if (query && query.source === 'scan') {
				this.title = t('scanResult')
			}
		},
		onShow() {
			const pendingContent = uni.getStorageSync('omniqr_pending_generate_content')
			const pendingSource = uni.getStorageSync('omniqr_pending_generate_source')
			if (pendingContent) {
				this.content = pendingContent
				this.generatedContent = ''
				this.title = pendingSource === 'scan' ? t('scanResult') : this.title
				uni.removeStorageSync('omniqr_pending_generate_content')
				uni.removeStorageSync('omniqr_pending_generate_source')
			}
		},
		methods: {
			t,
			onContentInput() {
				this.generatedContent = ''
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
			onTypeChange(event: { detail: { value: string | number } }) {
				this.typeIndex = Number(event.detail.value)
			},
			getSegmentStyle(index: number) {
				const active = this.typeIndex === index
				return {
					flex: 1,
					height: '64rpx',
					borderRadius: '14rpx',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: active ? '#0f766e' : 'transparent'
				}
			},
			handleGenerate() {
				if (!this.content.trim()) {
					uni.showToast({
						title: t('inputQrContent'),
						icon: 'none'
					})
					return
				}
				this.generatedContent = this.content.trim()
				this.watermarkSeed = `${this.generatedContent}-${Date.now()}`
				this.saveRecord(false)
				uni.showToast({
					title: t('qrGenerated'),
					icon: 'success'
				})
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
			saveRecord(showToast = true) {
				if (!this.generatedContent) {
					uni.showToast({
						title: t('generateFirst'),
						icon: 'none'
					})
					return
				}
				const type = this.types[this.typeIndex].recordType
				const settings = getSettings()
				addRecord({
					title: this.title.trim() || settings.defaultRecordTitle || this.generatedContent.slice(0, 16) || t('unnamedQr'),
					type: type as RecordType,
					content: this.generatedContent,
					styleSeed: this.watermarkSeed || this.generatedContent,
					desc: this.generatedContent.length > 32 ? `${this.generatedContent.slice(0, 32)}...` : this.generatedContent
				})
				if (showToast) {
					uni.showToast({
						title: t('savedRecord'),
						icon: 'success'
					})
				}
			},
			saveQrImage() {
				if (!this.generatedContent) {
					uni.showToast({
						title: t('generateFirst'),
						icon: 'none'
					})
					return
				}
				saveQrImageToAlbum(this.generatedContent, this, this.watermarkSeed, `omniqr-${Date.now()}.png`)
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
				exportQrPreviewImage(this.generatedContent, this, this.watermarkSeed)
					.then((tempFilePath: string) => {
						downloadQrImageFile(`omniqr-${Date.now()}.png`, tempFilePath)
						uni.previewImage({
							urls: [tempFilePath],
							current: tempFilePath,
							fail: () => {
								uni.showToast({
									title: t('generatedImageAppTip'),
									icon: 'none'
								})
							}
						})
					})
					.catch(() => {
						uni.showToast({
							title: t('saveImageFailed'),
							icon: 'none'
						})
					})
			},
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
		padding-bottom: 244rpx;
		padding-left: 28rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
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

	.form-card,
	.preview-card {
		padding: 22rpx;
		border-radius: 20rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
	}

	.field {
		display: flex;
		flex-direction: column;
	}

	.label,
	.section-title {
		font-size: 28rpx;
		font-weight: 650;
		color: #18202c;
	}

	.segmented {
		display: flex;
		padding: 6rpx;
		border-radius: 18rpx;
		background: #f1f5f9;
	}

	.segment-item {
		flex: 1;
		height: 60rpx;
		border-radius: 14rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.segment-item.active {
		background: #0f766e;
	}

	.segment-text {
		font-size: 26rpx;
		font-weight: 600;
		line-height: 1;
	}

	.field-head,
	.preview-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.field-count,
	.preview-status {
		font-size: 22rpx;
		color: #98a2b3;
	}

	.preview-status {
		height: 36rpx;
		padding: 0 14rpx;
		border-radius: 18rpx;
		background: #f1f5f9;
		color: #667085;
		line-height: 36rpx;
	}

	.preview-status.ready {
		background: #ecfdf5;
		color: #047857;
	}

	.input,
	.picker {
		height: 74rpx;
		padding: 0 20rpx;
		border-radius: 16rpx;
		border: 1rpx solid #b8c4d0;
		background: #ffffff;
		font-size: 28rpx;
		line-height: 74rpx;
		box-sizing: border-box;
	}

	.textarea {
		width: 100%;
		height: 168rpx;
		padding: 20rpx;
		border-radius: 16rpx;
		border: 1rpx solid #b8c4d0;
		background: #ffffff;
		font-size: 28rpx;
		line-height: 1.5;
		box-sizing: border-box;
	}

	.primary-button,
	.ghost-button {
		height: 82rpx;
		border-radius: 16rpx;
		font-size: 28rpx;
		line-height: 82rpx;
	}

	.primary-button {
		width: 100%;
		margin-top: 18rpx;
		background: #075e59;
		color: #ffffff;
		font-size: 30rpx;
		font-weight: 650;
	}

	.primary-button.muted {
		background: #98a2b3;
	}

	.ghost-button {
		flex: 1;
		height: 72rpx;
		background: #ffffff;
		color: #0f766e;
		border: 2rpx solid #0f766e;
		font-size: 26rpx;
		line-height: 72rpx;
	}

	.ghost-button.muted {
		color: #98a2b3;
		border-color: #d7dee8;
	}

	.primary-button::after,
	.primary-button::before,
	.ghost-button::after,
	.ghost-button::before {
		border: 0;
		background: transparent;
	}

	.actions {
		display: flex;
		margin-top: 14rpx;
	}

	.actions .ghost-button:first-child {
		margin-right: 8rpx;
	}

	.actions .ghost-button:last-child {
		margin-left: 8rpx;
	}

	.bottom-nav {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 112rpx;
		padding-bottom: env(safe-area-inset-bottom);
		background: #ffffff;
		border-top: 1rpx solid #e5e7eb;
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

	.export-canvas {
		position: fixed;
		left: -9999px;
		top: -9999px;
		width: 720px;
		height: 720px;
		pointer-events: none;
	}
</style>
