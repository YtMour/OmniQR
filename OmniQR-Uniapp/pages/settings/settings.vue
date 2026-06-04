<template>
	<view class="page" :style="{ paddingTop: safeTop + 'px' }">
		<view class="topbar">
			<image class="back-icon" src="/static/icons/back.webp" mode="aspectFit" @tap="goBack"></image>
			<text class="topbar-title">{{ t('settings') }}</text>
			<view class="topbar-spacer"></view>
		</view>

		<view class="card">
			<text class="section-title">{{ t('generationPrefs') }}</text>
			<view class="field">
				<text class="label">{{ t('defaultRecordTitle') }}</text>
				<input class="input" v-model="settings.defaultRecordTitle" :placeholder="t('defaultRecordTitlePlaceholder')" />
			</view>
			<view class="field">
				<text class="label">{{ t('language') }}</text>
				<picker :range="languageLabels" :value="languageIndex" @change="onLanguageChange">
					<view class="picker">{{ languageLabels[languageIndex] }}</view>
				</picker>
				<text class="hint">{{ t('languageHint') }}</text>
			</view>
			<view class="setting-row">
				<view class="setting-copy">
					<text class="label">{{ t('saveFailPreview') }}</text>
					<text class="hint">{{ t('saveFailPreviewHint') }}</text>
				</view>
				<switch :checked="settings.previewImageOnSaveFail" color="#0f766e" @change="onPreviewFallbackChange" />
			</view>
			<view class="field">
				<text class="label">{{ t('defaultQrSize') }}</text>
				<picker :range="qrSizeLabels" :value="qrSizeIndex" @change="onQrSizeChange">
					<view class="picker">{{ qrSizeLabels[qrSizeIndex] }}</view>
				</picker>
			</view>
			<view class="setting-row">
				<view class="setting-copy">
					<text class="label">{{ t('beautifyQr') }}</text>
					<text class="hint">{{ t('beautifyQrHint') }}</text>
				</view>
				<switch :checked="settings.beautifyQr" color="#0f766e" @change="onBeautifyQrChange" />
			</view>
			<view class="field">
				<text class="label">{{ t('qrTheme') }}</text>
				<picker :range="qrThemeLabels" :value="qrThemeIndex" @change="onQrThemeChange">
					<view class="picker">{{ qrThemeLabels[qrThemeIndex] }}</view>
				</picker>
				<text class="hint">{{ t('qrThemeHint') }}</text>
			</view>
			<view class="setting-row">
				<view class="setting-copy">
					<text class="label">{{ t('useFixedQrColors') }}</text>
					<text class="hint">{{ t('useFixedQrColorsHint') }}</text>
				</view>
				<switch :checked="settings.useFixedQrColors" color="#0f766e" @change="onFixedColorChange" />
			</view>
			<view class="field">
				<text class="label">{{ t('foregroundColor') }}</text>
				<input class="input" v-model="settings.foregroundColor" placeholder="#111827" />
			</view>
			<view class="field">
				<text class="label">{{ t('backgroundColor') }}</text>
				<input class="input" v-model="settings.backgroundColor" placeholder="#ffffff" />
				<text class="hint">{{ t('qrStyleHint') }}</text>
			</view>
			<button class="primary-button" @tap="save">{{ t('saveSettings') }}</button>
		</view>

		<view class="card">
			<text class="section-title">{{ t('dataManagement') }}</text>
			<view class="stats-row">
				<text class="stats-main">{{ recordCount }} {{ t('localRecordCount') }}</text>
				<text class="stats-sub">{{ favoriteCount }} {{ t('favoriteCountSuffix') }}</text>
			</view>
			<button class="ghost-button" @tap="exportData">{{ t('exportJson') }}</button>
			<button class="ghost-button" @tap="importData">{{ t('importJson') }}</button>
			<button class="ghost-button" @tap="clearNonFavorites">{{ t('clearNonFavorites') }}</button>
			<button class="danger-button" @tap="clearAllRecords">{{ t('clearAllRecords') }}</button>
		</view>

		<view class="card">
			<text class="section-title">{{ t('privacySummary') }}</text>
			<text class="privacy-text">{{ t('privacySummaryText') }}</text>
			<button class="ghost-button" @tap="openPrivacy">{{ t('privacyPolicy') }}</button>
			<button class="ghost-button" @tap="reset">{{ t('resetSettings') }}</button>
		</view>
	</view>
</template>

<script lang="ts">
	import { defaultSettings, getSettings, resetSettings, saveSettings, type OmniQrSettings, type QrSizeOption } from '../../common/settingsStore'
	import { languageOptions, setLanguage, t, type I18nKey } from '../../common/i18n'
	import { listRecords, type QrRecord } from '../../common/recordStore'
	import { createBackupJson, downloadJsonFile, importBackupJson } from '../../common/dataBackup'
	import { qrThemeOptions } from '../../common/qrStyle'

	const RECORDS_KEY = 'omniqr_records'

	export default {
		data() {
			return {
				safeTop: 48,
				settings: { ...defaultSettings } as OmniQrSettings,
				activeLanguage: defaultSettings.language,
				qrSizes: ['小', '中', '大'] as QrSizeOption[],
				qrThemeOptions,
				languageOptions,
				i18nVersion: 0,
				recordCount: 0,
				favoriteCount: 0
			}
		},
		onLoad() {
			this.safeTop = this.getSafeTop()
		},
		onShow() {
			this.settings = getSettings()
			this.activeLanguage = this.settings.language
			this.refreshStats()
		},
		computed: {
			qrSizeIndex() {
				return Math.max(0, this.qrSizes.indexOf(this.settings.qrSize))
			},
			qrSizeLabels() {
				this.activeLanguage
				this.i18nVersion
				const map = {
					小: t('qrSizeSmall'),
					中: t('qrSizeMedium'),
					大: t('qrSizeLarge')
				}
				return this.qrSizes.map((size) => map[size])
			},
			languageLabels() {
				this.activeLanguage
				this.i18nVersion
				return this.languageOptions.map((option) => option.label)
			},
			languageIndex() {
				return Math.max(0, this.languageOptions.findIndex((option) => option.value === this.settings.language))
			},
			qrThemeIndex() {
				return Math.max(0, this.qrThemeOptions.findIndex((option) => option.value === this.settings.qrTheme))
			},
			qrThemeLabels() {
				this.activeLanguage
				this.i18nVersion
				return this.qrThemeOptions.map((option) => t(option.labelKey as I18nKey))
			}
		},
		methods: {
			t(key: I18nKey) {
				this.activeLanguage
				this.i18nVersion
				return t(key)
			},
			getSafeTop() {
				const info = uni.getSystemInfoSync()
				return (info.statusBarHeight || 24) + 12
			},
			goBack() {
				uni.reLaunch({
					url: '/pages/index/index'
				})
			},
			openPrivacy() {
				uni.navigateTo({
					url: '/pages/privacy/privacy'
				})
			},
			onPreviewFallbackChange(event: { detail: { value: boolean } }) {
				this.settings.previewImageOnSaveFail = event.detail.value
			},
			onQrSizeChange(event: { detail: { value: string | number } }) {
				this.settings.qrSize = this.qrSizes[Number(event.detail.value)]
			},
			onBeautifyQrChange(event: { detail: { value: boolean } }) {
				this.settings.beautifyQr = event.detail.value
			},
			onQrThemeChange(event: { detail: { value: string | number } }) {
				this.settings.qrTheme = this.qrThemeOptions[Number(event.detail.value)].value
			},
			onFixedColorChange(event: { detail: { value: boolean } }) {
				this.settings.useFixedQrColors = event.detail.value
			},
			onLanguageChange(event: { detail: { value: string | number } }) {
				this.settings.language = this.languageOptions[Number(event.detail.value)].value
			},
			save() {
				this.settings.defaultRecordTitle = this.settings.defaultRecordTitle.trim()
				this.settings.foregroundColor = this.normalizeColor(this.settings.foregroundColor, defaultSettings.foregroundColor)
				this.settings.backgroundColor = this.normalizeColor(this.settings.backgroundColor, defaultSettings.backgroundColor)
				this.settings = saveSettings(this.settings)
				setLanguage(this.settings.language)
				this.settings = getSettings()
				this.activeLanguage = this.settings.language
				this.i18nVersion += 1
				uni.showToast({
					title: t('settingsSaved'),
					icon: 'success'
				})
			},
			reset() {
				this.settings = resetSettings()
				uni.showToast({
					title: t('settingsReset'),
					icon: 'success'
				})
			},
			normalizeColor(color: string, fallback: string) {
				return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback
			},
			refreshStats() {
				const records = listRecords()
				this.recordCount = records.length
				this.favoriteCount = records.filter((record) => record.favorite).length
			},
			exportData() {
				const data = createBackupJson()
				uni.setClipboardData({
					data,
					success: () => {
						downloadJsonFile(`omniqr-backup-${Date.now()}.json`, data)
						uni.showToast({
							title: t('jsonCopied'),
							icon: 'success'
						})
					}
				})
			},
			importData() {
				uni.showModal({
					title: t('importJson'),
					editable: true,
					placeholderText: t('importJsonPlaceholder'),
					confirmText: t('import'),
					success: (res) => {
						if (!res.confirm) {
							return
						}
						try {
							const result = importBackupJson(res.content || '')
							this.settings = getSettings()
							this.refreshStats()
							uni.showToast({
								title: `${t('imported')}${result.imported}，${t('skipped')}${result.skipped}`,
								icon: 'none'
							})
						} catch (_error) {
							uni.showToast({
								title: t('importFailed'),
								icon: 'none'
							})
						}
					}
				})
			},
			clearNonFavorites() {
				const records = listRecords().filter((record: QrRecord) => record.favorite)
				uni.setStorageSync(RECORDS_KEY, records)
				this.refreshStats()
				uni.showToast({
					title: t('keptFavorites'),
					icon: 'success'
				})
			},
			clearAllRecords() {
				uni.showModal({
					title: t('clearAllTitle'),
					content: t('clearAllContent'),
					confirmText: t('clear'),
					confirmColor: '#b42318',
					success: (res) => {
						if (!res.confirm) {
							return
						}
						uni.setStorageSync(RECORDS_KEY, [])
						this.refreshStats()
						uni.showToast({
							title: t('recordsCleared'),
							icon: 'success'
						})
					}
				})
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
		gap: 22rpx;
	}

	.topbar {
		height: 76rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.topbar-spacer,
	.back-icon {
		width: 64rpx;
		height: 64rpx;
		flex-shrink: 0;
	}

	.topbar-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #111827;
	}

	.card {
		padding: 26rpx;
		border-radius: 18rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
		display: flex;
		flex-direction: column;
		gap: 22rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 750;
		line-height: 1.25;
		color: #111827;
	}

	.field,
	.setting-copy {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}

	.setting-row,
	.stats-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}

	.setting-copy {
		flex: 1;
		min-width: 0;
	}

	.label,
	.stats-main {
		font-size: 28rpx;
		font-weight: 650;
		line-height: 1.3;
		color: #18202c;
	}

	.hint,
	.stats-sub,
	.privacy-text {
		font-size: 24rpx;
		line-height: 1.45;
		color: #667085;
	}

	.input,
	.picker {
		height: 82rpx;
		padding: 0 22rpx;
		border-radius: 14rpx;
		border: 1rpx solid #b8c4d0;
		background: #ffffff;
		font-size: 28rpx;
		line-height: 82rpx;
		box-sizing: border-box;
	}

	.primary-button,
	.ghost-button,
	.danger-button {
		height: 78rpx;
		margin: 0;
		padding: 0;
		border-radius: 14rpx;
		font-size: 28rpx;
		font-weight: 650;
		line-height: 78rpx;
		box-sizing: border-box;
		overflow: hidden;
	}

	.primary-button {
		background: #075e59;
		color: #ffffff;
	}

	.ghost-button {
		background: #ffffff;
		color: #0f766e;
		border: 2rpx solid #0f766e;
	}

	.danger-button {
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
</style>
