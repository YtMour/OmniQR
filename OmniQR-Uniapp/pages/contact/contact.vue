<template>
	<view class="page" :style="{ paddingTop: safeTop + 'px' }">
		<view class="topbar">
			<image class="back-icon" src="/static/icons/back.webp" mode="aspectFit" style="width: 64rpx; height: 64rpx; flex-shrink: 0;" @tap="goBack"></image>
			<text class="topbar-title">{{ t('contactTitle') }}</text>
			<view class="topbar-spacer"></view>
		</view>

		<view class="card">
			<text class="page-desc">{{ t('contactDesc') }}</text>

			<view class="field">
				<text class="label">{{ t('name') }}</text>
				<input class="input" v-model="form.name" :placeholder="t('inputName')" @input="clearGenerated" />
			</view>
			<view class="field">
				<text class="label">{{ t('phone') }}</text>
				<input class="input" v-model="form.phone" :placeholder="t('inputPhone')" @input="clearGenerated" />
			</view>
			<view class="field">
				<text class="label">{{ t('company') }}</text>
				<input class="input" v-model="form.company" :placeholder="t('inputCompany')" @input="clearGenerated" />
			</view>
			<view class="field">
				<text class="label">{{ t('jobTitle') }}</text>
				<input class="input" v-model="form.title" :placeholder="t('inputJobTitle')" @input="clearGenerated" />
			</view>
			<view class="field">
				<text class="label">{{ t('email') }}</text>
				<input class="input" v-model="form.email" :placeholder="t('inputEmail')" @input="clearGenerated" />
			</view>
			<view class="field">
				<text class="label">{{ t('website') }}</text>
				<input class="input" v-model="form.url" :placeholder="t('websiteExample')" @input="clearGenerated" />
			</view>
			<view class="field">
				<text class="label">{{ t('address') }}</text>
				<input class="input" v-model="form.address" :placeholder="t('inputAddress')" @input="clearGenerated" />
			</view>
			<view class="field">
				<text class="label">{{ t('note') }}</text>
				<textarea class="textarea" v-model="form.note" maxlength="200" :placeholder="t('notePlaceholder')" @input="clearGenerated" />
			</view>
			<view class="field">
				<text class="label">{{ t('recordTitle') }}</text>
				<input class="input" v-model="recordTitle" :placeholder="t('contactTitleExample')" />
			</view>

			<view class="preview">
				<text class="preview-title">{{ t('vcardPreview') }}</text>
				<text class="preview-text">{{ vcard }}</text>
			</view>

			<view class="qr-stage">
				<QrPreview :content="generatedContent" :watermarkSeed="watermarkSeed" />
			</view>

			<button class="primary-button" @tap="submit">{{ t('generateContactQr') }}</button>
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

	function escapeVCardValue(value: string) {
		return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
	}

	export default {
		components: {
			QrPreview
		},
		data() {
			return {
				safeTop: 48,
				form: {
					name: '',
					phone: '',
					company: '',
					title: '',
					email: '',
					url: '',
					address: '',
					note: ''
				},
				recordTitle: '',
				generatedContent: '',
				watermarkSeed: '',
				exportCanvasId: QR_EXPORT_CANVAS_ID
			}
		},
		onLoad() {
			this.safeTop = this.getSafeTop()
		},
		computed: {
			vcard() {
				const lines = [
					'BEGIN:VCARD',
					'VERSION:3.0',
					`FN:${escapeVCardValue(this.form.name.trim() || t('namePlaceholder'))}`
				]
				if (this.form.company.trim()) {
					lines.push(`ORG:${escapeVCardValue(this.form.company.trim())}`)
				}
				if (this.form.title.trim()) {
					lines.push(`TITLE:${escapeVCardValue(this.form.title.trim())}`)
				}
				if (this.form.phone.trim()) {
					lines.push(`TEL;TYPE=CELL:${escapeVCardValue(this.form.phone.trim())}`)
				}
				if (this.form.email.trim()) {
					lines.push(`EMAIL:${escapeVCardValue(this.form.email.trim())}`)
				}
				if (this.form.url.trim()) {
					lines.push(`URL:${escapeVCardValue(this.form.url.trim())}`)
				}
				if (this.form.address.trim()) {
					lines.push(`ADR:;;${escapeVCardValue(this.form.address.trim())}`)
				}
				if (this.form.note.trim()) {
					lines.push(`NOTE:${escapeVCardValue(this.form.note.trim())}`)
				}
				lines.push('END:VCARD')
				return lines.join('\n')
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
			submit() {
				if (!this.form.name.trim()) {
					uni.showToast({
						title: t('inputName'),
						icon: 'none'
					})
					return
				}
				this.generatedContent = this.vcard
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
					title: this.recordTitle.trim() || settings.defaultRecordTitle || `${this.form.name.trim()}${t('contactTitleSuffix')}`,
					type: '名片',
					content: this.generatedContent,
					desc: [this.form.company.trim(), this.form.title.trim(), this.form.phone.trim()].filter(Boolean).join(' · ') || this.form.name.trim()
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
		white-space: pre-wrap;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.label,
	.preview-title {
		font-size: 28rpx;
		font-weight: 650;
		color: #18202c;
	}

	.input,
	.textarea {
		height: 84rpx;
		padding: 0 22rpx;
		border-radius: 14rpx;
		border: 1rpx solid #b8c4d0;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.textarea {
		width: 100%;
		height: 132rpx;
		padding: 18rpx 22rpx;
		line-height: 1.45;
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
