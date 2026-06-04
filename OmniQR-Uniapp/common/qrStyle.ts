import { getSettings, type OmniQrSettings, type QrThemeId } from './settingsStore'

export type WatermarkCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type FrameStyle = 'classic' | 'double' | 'soft' | 'corner' | 'ticket' | 'bracket' | 'stamp' | 'neon' | 'layer' | 'plain'
export type ModuleStyle = 'square' | 'soft' | 'dot' | 'tiny' | 'diamond' | 'rounded' | 'plus' | 'slash' | 'vertical' | 'hollow'
export type FinderStyle = 'square' | 'round' | 'diamond' | 'bracket' | 'neon' | 'stamp' | 'minimal' | 'target' | 'leaf' | 'block'

export type QrVisualStyle = {
	foregroundColor: string
	backgroundColor: string
	accentColor: string
	frameStyle: FrameStyle
	moduleStyle: ModuleStyle
	finderStyle: FinderStyle
	watermarkCorner: WatermarkCorner
	beautify: boolean
	theme: Exclude<QrThemeId, 'random'>
	variant: number
}

type QrPalette = {
	foreground: string
	background: string
	accent: string
}

type ThemeVariant = {
	palette: QrPalette
	frameStyle: FrameStyle
	moduleStyle: ModuleStyle
	finderStyle: FinderStyle
}

type ThemeDefinition = {
	id: Exclude<QrThemeId, 'random'>
	labelKey: string
	variants: ThemeVariant[]
}

function variant(foreground: string, background: string, accent: string, frameStyle: FrameStyle, moduleStyle: ModuleStyle, finderStyle: FinderStyle): ThemeVariant {
	return {
		palette: { foreground, background, accent },
		frameStyle,
		moduleStyle,
		finderStyle
	}
}

export const qrThemeOptions: Array<{ labelKey: string; value: QrThemeId }> = [
	{ labelKey: 'qrThemeRandom', value: 'random' },
	{ labelKey: 'qrThemeGeek', value: 'geek' },
	{ labelKey: 'qrThemeFresh', value: 'fresh' },
	{ labelKey: 'qrThemeMinimal', value: 'minimal' },
	{ labelKey: 'qrThemeBusiness', value: 'business' },
	{ labelKey: 'qrThemeRetro', value: 'retro' },
	{ labelKey: 'qrThemePop', value: 'pop' },
	{ labelKey: 'qrThemeMono', value: 'mono' },
	{ labelKey: 'qrThemeWarm', value: 'warm' }
]

const themeDefinitions: ThemeDefinition[] = [
	{
		id: 'geek',
		labelKey: 'qrThemeGeek',
		variants: [
			variant('#00f5d4', '#03120f', '#00bbf9', 'neon', 'square', 'square'),
			variant('#7dd3fc', '#0f172a', '#38bdf8', 'corner', 'tiny', 'minimal'),
			variant('#a7f3d0', '#022c22', '#34d399', 'double', 'plus', 'block'),
			variant('#c4b5fd', '#111827', '#8b5cf6', 'bracket', 'slash', 'bracket'),
			variant('#67e8f9', '#082f49', '#06b6d4', 'layer', 'diamond', 'diamond'),
			variant('#86efac', '#052e16', '#22c55e', 'stamp', 'vertical', 'stamp'),
			variant('#93c5fd', '#020617', '#3b82f6', 'ticket', 'hollow', 'neon'),
			variant('#f0fdfa', '#134e4a', '#2dd4bf', 'soft', 'rounded', 'leaf'),
			variant('#e0f2fe', '#0c4a6e', '#0ea5e9', 'classic', 'dot', 'target'),
			variant('#ccfbf1', '#042f2e', '#14b8a6', 'plain', 'soft', 'round')
		]
	},
	{
		id: 'fresh',
		labelKey: 'qrThemeFresh',
		variants: [
			variant('#166534', '#f0fdf4', '#22c55e', 'soft', 'rounded', 'leaf'),
			variant('#0f766e', '#ecfdf5', '#14b8a6', 'ticket', 'dot', 'target'),
			variant('#2563eb', '#eff6ff', '#60a5fa', 'corner', 'soft', 'round'),
			variant('#047857', '#f7fee7', '#84cc16', 'double', 'tiny', 'minimal'),
			variant('#0369a1', '#f0f9ff', '#38bdf8', 'layer', 'vertical', 'stamp'),
			variant('#15803d', '#f8fafc', '#4ade80', 'classic', 'plus', 'block'),
			variant('#0e7490', '#ecfeff', '#22d3ee', 'bracket', 'diamond', 'diamond'),
			variant('#4d7c0f', '#f7fee7', '#a3e635', 'stamp', 'hollow', 'neon'),
			variant('#065f46', '#f0fdfa', '#2dd4bf', 'plain', 'square', 'square'),
			variant('#1d4ed8', '#f8fafc', '#93c5fd', 'neon', 'slash', 'bracket')
		]
	},
	{
		id: 'minimal',
		labelKey: 'qrThemeMinimal',
		variants: [
			variant('#111827', '#ffffff', '#6b7280', 'plain', 'square', 'square'),
			variant('#1f2937', '#f9fafb', '#9ca3af', 'classic', 'tiny', 'minimal'),
			variant('#0f172a', '#f8fafc', '#64748b', 'soft', 'soft', 'round'),
			variant('#27272a', '#fafafa', '#71717a', 'corner', 'rounded', 'leaf'),
			variant('#374151', '#ffffff', '#9ca3af', 'double', 'hollow', 'neon'),
			variant('#18181b', '#f4f4f5', '#a1a1aa', 'ticket', 'dot', 'target'),
			variant('#334155', '#ffffff', '#94a3b8', 'bracket', 'vertical', 'stamp'),
			variant('#0f172a', '#ffffff', '#475569', 'layer', 'square', 'square'),
			variant('#3f3f46', '#fafafa', '#71717a', 'stamp', 'soft', 'round'),
			variant('#111827', '#f3f4f6', '#6b7280', 'plain', 'diamond', 'diamond')
		]
	},
	{
		id: 'business',
		labelKey: 'qrThemeBusiness',
		variants: [
			variant('#1e3a8a', '#f8fafc', '#2563eb', 'classic', 'square', 'square'),
			variant('#0f172a', '#eff6ff', '#1d4ed8', 'double', 'soft', 'round'),
			variant('#1f2937', '#f9fafb', '#4b5563', 'corner', 'tiny', 'minimal'),
			variant('#164e63', '#ecfeff', '#0891b2', 'ticket', 'rounded', 'leaf'),
			variant('#312e81', '#eef2ff', '#4f46e5', 'bracket', 'vertical', 'stamp'),
			variant('#0f172a', '#ffffff', '#334155', 'layer', 'hollow', 'neon'),
			variant('#1e40af', '#f0f9ff', '#0284c7', 'stamp', 'plus', 'block'),
			variant('#374151', '#f3f4f6', '#6b7280', 'plain', 'square', 'square'),
			variant('#0c4a6e', '#f8fafc', '#0369a1', 'soft', 'dot', 'target'),
			variant('#172554', '#eff6ff', '#2563eb', 'neon', 'diamond', 'diamond')
		]
	},
	{
		id: 'retro',
		labelKey: 'qrThemeRetro',
		variants: [
			variant('#422006', '#fffbeb', '#d97706', 'ticket', 'square', 'square'),
			variant('#7c2d12', '#fff7ed', '#ea580c', 'stamp', 'soft', 'round'),
			variant('#713f12', '#fefce8', '#ca8a04', 'corner', 'dot', 'target'),
			variant('#3f1d1d', '#fff1f2', '#be123c', 'double', 'tiny', 'minimal'),
			variant('#78350f', '#fffbeb', '#f59e0b', 'bracket', 'diamond', 'diamond'),
			variant('#451a03', '#fef3c7', '#b45309', 'layer', 'hollow', 'neon'),
			variant('#581c87', '#faf5ff', '#a855f7', 'classic', 'rounded', 'leaf'),
			variant('#5f3b16', '#faf7f0', '#a16207', 'soft', 'vertical', 'stamp'),
			variant('#4a2c18', '#fff7ed', '#c2410c', 'plain', 'slash', 'bracket'),
			variant('#6b2d12', '#ffedd5', '#fb923c', 'neon', 'plus', 'block')
		]
	},
	{
		id: 'pop',
		labelKey: 'qrThemePop',
		variants: [
			variant('#831843', '#fdf2f8', '#ec4899', 'neon', 'dot', 'target'),
			variant('#581c87', '#faf5ff', '#d946ef', 'ticket', 'diamond', 'diamond'),
			variant('#7f1d1d', '#fff1f2', '#f43f5e', 'corner', 'plus', 'block'),
			variant('#312e81', '#eef2ff', '#6366f1', 'double', 'slash', 'bracket'),
			variant('#0e7490', '#ecfeff', '#06b6d4', 'bracket', 'rounded', 'leaf'),
			variant('#9f1239', '#fff7ed', '#fb7185', 'stamp', 'tiny', 'minimal'),
			variant('#6d28d9', '#f5f3ff', '#8b5cf6', 'layer', 'hollow', 'neon'),
			variant('#be123c', '#fdf2f8', '#f472b6', 'soft', 'vertical', 'stamp'),
			variant('#4338ca', '#eef2ff', '#818cf8', 'classic', 'soft', 'round'),
			variant('#a21caf', '#fae8ff', '#e879f9', 'plain', 'square', 'square')
		]
	},
	{
		id: 'mono',
		labelKey: 'qrThemeMono',
		variants: [
			variant('#000000', '#ffffff', '#111111', 'plain', 'square', 'square'),
			variant('#111111', '#f5f5f5', '#404040', 'classic', 'tiny', 'minimal'),
			variant('#262626', '#fafafa', '#525252', 'double', 'soft', 'round'),
			variant('#171717', '#ffffff', '#737373', 'corner', 'dot', 'target'),
			variant('#0a0a0a', '#f5f5f5', '#404040', 'bracket', 'vertical', 'stamp'),
			variant('#1c1917', '#fafaf9', '#57534e', 'stamp', 'diamond', 'diamond'),
			variant('#292524', '#f5f5f4', '#78716c', 'ticket', 'rounded', 'leaf'),
			variant('#18181b', '#ffffff', '#52525b', 'layer', 'hollow', 'neon'),
			variant('#27272a', '#f4f4f5', '#71717a', 'soft', 'slash', 'bracket'),
			variant('#111827', '#f9fafb', '#374151', 'neon', 'plus', 'block')
		]
	},
	{
		id: 'warm',
		labelKey: 'qrThemeWarm',
		variants: [
			variant('#7c2d12', '#fff7ed', '#fb923c', 'soft', 'rounded', 'leaf'),
			variant('#9a3412', '#fffbeb', '#f97316', 'ticket', 'dot', 'target'),
			variant('#78350f', '#fef3c7', '#f59e0b', 'corner', 'tiny', 'minimal'),
			variant('#7f1d1d', '#fff1f2', '#ef4444', 'double', 'soft', 'round'),
			variant('#854d0e', '#fefce8', '#eab308', 'bracket', 'vertical', 'stamp'),
			variant('#881337', '#fff1f2', '#fb7185', 'stamp', 'diamond', 'diamond'),
			variant('#92400e', '#fffbeb', '#d97706', 'layer', 'hollow', 'neon'),
			variant('#6b2d12', '#fff7ed', '#ea580c', 'plain', 'square', 'square'),
			variant('#713f12', '#fef9c3', '#ca8a04', 'classic', 'plus', 'block'),
			variant('#7c2d12', '#ffedd5', '#f97316', 'neon', 'slash', 'bracket')
		]
	}
]
const corners: WatermarkCorner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

export function hashSeed(seed: string) {
	let hash = 2166136261
	for (let index = 0; index < seed.length; index += 1) {
		hash ^= seed.charCodeAt(index)
		hash = Math.imul(hash, 16777619)
	}
	return hash >>> 0
}

export function normalizeColor(color: string, fallback: string) {
	return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback
}

function hexToRgb(color: string) {
	const normalized = normalizeColor(color, '#111827').slice(1)
	return {
		r: Number.parseInt(normalized.slice(0, 2), 16),
		g: Number.parseInt(normalized.slice(2, 4), 16),
		b: Number.parseInt(normalized.slice(4, 6), 16)
	}
}

function toScanSafeModuleStyle(moduleStyle: ModuleStyle): ModuleStyle {
	const map: Record<ModuleStyle, ModuleStyle> = {
		square: 'square',
		soft: 'soft',
		dot: 'rounded',
		tiny: 'dot',
		diamond: 'soft',
		rounded: 'rounded',
		plus: 'rounded',
		slash: 'soft',
		vertical: 'soft',
		hollow: 'dot'
	}
	return map[moduleStyle]
}

function channelToLinear(channel: number) {
	const value = channel / 255
	return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)
}

function getLuminance(color: string) {
	const rgb = hexToRgb(color)
	return channelToLinear(rgb.r) * 0.2126 + channelToLinear(rgb.g) * 0.7152 + channelToLinear(rgb.b) * 0.0722
}

function getContrastRatio(firstColor: string, secondColor: string) {
	const first = getLuminance(firstColor)
	const second = getLuminance(secondColor)
	const lighter = Math.max(first, second)
	const darker = Math.min(first, second)
	return (lighter + 0.05) / (darker + 0.05)
}

function getSafeQrColors(foreground: string, background: string) {
	const fallback = {
		foregroundColor: '#111827',
		backgroundColor: '#ffffff'
	}
	const foregroundLuminance = getLuminance(foreground)
	const backgroundLuminance = getLuminance(background)
	const hasReadableContrast = getContrastRatio(foreground, background) >= 7
	const isDarkOnLight = foregroundLuminance < 0.42 && backgroundLuminance > 0.78

	if (hasReadableContrast && isDarkOnLight) {
		return {
			foregroundColor: foreground,
			backgroundColor: background
		}
	}

	return fallback
}

export function getQrVisualStyle(seed: string): QrVisualStyle {
	const settings = getSettings()
	const hash = hashSeed(seed || 'omniqr')
	const themes = themeDefinitions
	const selectedTheme = settings.qrTheme === 'random' ? themes[hash % themes.length] : themes.find((theme) => theme.id === settings.qrTheme) || themes[0]
	const variantIndex = (hash >>> 5) % selectedTheme.variants.length
	const selectedVariant = selectedTheme.variants[variantIndex]
	const palette = selectedVariant.palette
	const fixedForeground = normalizeColor(settings.foregroundColor, '#111827')
	const fixedBackground = normalizeColor(settings.backgroundColor, '#ffffff')
	const useFixed = settings.useFixedQrColors
	const preferredForeground = useFixed ? fixedForeground : palette.foreground
	const preferredBackground = useFixed ? fixedBackground : palette.background
	const safeColors = getSafeQrColors(preferredForeground, preferredBackground)
	const foregroundColor = safeColors.foregroundColor
	const backgroundColor = safeColors.backgroundColor
	const accentColor = useFixed ? (fixedForeground === fixedBackground ? '#075e59' : fixedForeground) : palette.accent
	const beautify = settings.beautifyQr

	return {
		foregroundColor,
		backgroundColor,
		accentColor,
		frameStyle: beautify ? selectedVariant.frameStyle : 'classic',
		moduleStyle: beautify ? toScanSafeModuleStyle(selectedVariant.moduleStyle) : 'square',
		finderStyle: 'square',
		watermarkCorner: corners[(hash >>> 12) % corners.length],
		beautify,
		theme: selectedTheme.id,
		variant: variantIndex
	}
}

export const qrPaddingBySize: Record<OmniQrSettings['qrSize'], number> = {
	小: 34,
	中: 22,
	大: 12
}
