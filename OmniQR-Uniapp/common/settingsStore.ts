export type QrSizeOption = '小' | '中' | '大'
export type AppLanguage = 'zh-Hans' | 'zh-Hant' | 'en' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'pt-BR' | 'ru' | 'ar' | 'hi'
export type QrThemeId = 'random' | 'geek' | 'fresh' | 'minimal' | 'business' | 'retro' | 'pop' | 'mono' | 'warm'

export type OmniQrSettings = {
	defaultRecordTitle: string
	language: AppLanguage
	previewImageOnSaveFail: boolean
	qrSize: QrSizeOption
	beautifyQr: boolean
	qrTheme: QrThemeId
	useFixedQrColors: boolean
	foregroundColor: string
	backgroundColor: string
}

const STORAGE_KEY = 'omniqr_settings'

export const defaultSettings: OmniQrSettings = {
	defaultRecordTitle: '',
	language: 'zh-Hans',
	previewImageOnSaveFail: true,
	qrSize: '中',
	beautifyQr: true,
	qrTheme: 'random',
	useFixedQrColors: false,
	foregroundColor: '#111827',
	backgroundColor: '#ffffff'
}

export function getSettings(): OmniQrSettings {
	const settings = uni.getStorageSync(STORAGE_KEY)
	if (settings && typeof settings === 'object') {
		return {
			...defaultSettings,
			...(settings as Partial<OmniQrSettings>)
		}
	}
	return { ...defaultSettings }
}

export function saveSettings(settings: OmniQrSettings): OmniQrSettings {
	const nextSettings = {
		...defaultSettings,
		...settings
	}
	uni.setStorageSync(STORAGE_KEY, nextSettings)
	return nextSettings
}

export function resetSettings(): OmniQrSettings {
	uni.setStorageSync(STORAGE_KEY, defaultSettings)
	return { ...defaultSettings }
}
