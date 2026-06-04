import type { FrameStyle, WatermarkCorner } from './qrStyle'
import type { OmniQrSettings } from './settingsStore'

export const QR_EXPORT_CANVAS_SIZE = 720
export const QR_FRAME_RATIO = 0.975
export const QR_FRAME_PADDING_RATIO = (1 - QR_FRAME_RATIO) / 2
export const QR_FRAME_BORDER_RATIO = 7 / 430
export const QR_SOFT_FRAME_BORDER_RATIO = 8 / 430
export const QR_FRAME_RADIUS_RATIO = 20 / 430
export const QR_TICKET_FRAME_RADIUS_RATIO = 28 / 430
export const QR_MATRIX_BOX_RATIO = 0.949
export const QR_MATRIX_INNER_PADDING_RATIO = 0.022
export const QR_WATERMARK_WIDTH_RATIO = 0.135
export const QR_WATERMARK_HEIGHT_RATIO = 0.036
export const QR_WATERMARK_FONT_RATIO = 0.026
export const QR_WATERMARK_LETTER_SPACING_RATIO = 0.0026

export type QrRenderLayout = {
	baseSize: number
	framePadding: number
	frameSize: number
	frameBorder: number
	frameRadius: number
	frameContentSize: number
	matrixBoxSize: number
	matrixBoxInset: number
	matrixPadding: number
	qrBoxSize: number
	qrStart: number
	watermarkWidth: number
	watermarkHeight: number
	watermarkFontSize: number
	watermarkLetterSpacing: number
}

export type QrWatermarkRect = {
	x: number
	y: number
	width: number
	height: number
}

export type QrWatermarkFramePosition = Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>

export function getQrPreviewSizeRpx(size: OmniQrSettings['qrSize']) {
	const map: Record<OmniQrSettings['qrSize'], number> = {
		小: 360,
		中: 430,
		大: 520
	}
	return map[size] || map['中']
}

export function getQrFrameBorderSize(baseSize: number, frameStyle: FrameStyle) {
	const ratio = frameStyle === 'soft' ? QR_SOFT_FRAME_BORDER_RATIO : QR_FRAME_BORDER_RATIO
	return baseSize * ratio
}

export function getQrFrameRadiusSize(baseSize: number, frameStyle: FrameStyle) {
	const ratio = frameStyle === 'ticket' ? QR_TICKET_FRAME_RADIUS_RATIO : QR_FRAME_RADIUS_RATIO
	return baseSize * ratio
}

export function getQrRenderLayout(baseSize: number, frameStyle: FrameStyle): QrRenderLayout {
	const framePadding = baseSize * QR_FRAME_PADDING_RATIO
	const frameSize = baseSize * QR_FRAME_RATIO
	const frameBorder = getQrFrameBorderSize(baseSize, frameStyle)
	const frameRadius = getQrFrameRadiusSize(baseSize, frameStyle)
	const frameContentSize = frameSize - frameBorder * 2
	const matrixBoxSize = frameContentSize * QR_MATRIX_BOX_RATIO
	const matrixBoxInset = (frameContentSize - matrixBoxSize) / 2
	const matrixPadding = matrixBoxSize * QR_MATRIX_INNER_PADDING_RATIO
	const qrBoxSize = matrixBoxSize - matrixPadding * 2
	const qrStart = framePadding + frameBorder + matrixBoxInset + matrixPadding
	const watermarkWidth = baseSize * QR_WATERMARK_WIDTH_RATIO
	const watermarkHeight = baseSize * QR_WATERMARK_HEIGHT_RATIO
	const watermarkFontSize = baseSize * QR_WATERMARK_FONT_RATIO
	const watermarkLetterSpacing = baseSize * QR_WATERMARK_LETTER_SPACING_RATIO

	return {
		baseSize,
		framePadding,
		frameSize,
		frameBorder,
		frameRadius,
		frameContentSize,
		matrixBoxSize,
		matrixBoxInset,
		matrixPadding,
		qrBoxSize,
		qrStart,
		watermarkWidth,
		watermarkHeight,
		watermarkFontSize,
		watermarkLetterSpacing
	}
}

export function getQrWatermarkRect(corner: WatermarkCorner, layout: QrRenderLayout): QrWatermarkRect {
	const outerX = layout.framePadding
	const outerY = layout.framePadding
	const cornerInset = Math.max(layout.frameRadius * 1.25, layout.frameBorder * 4)
	const verticalInset = layout.frameBorder / 2 - layout.watermarkHeight / 2
	const top = outerY + verticalInset
	const bottom = outerY + layout.frameSize - layout.frameBorder / 2 - layout.watermarkHeight / 2
	const left = outerX + cornerInset
	const right = outerX + layout.frameSize - cornerInset - layout.watermarkWidth
	const x = corner.includes('right') ? right : left
	const y = corner.includes('bottom') ? bottom : top

	return {
		x,
		y,
		width: layout.watermarkWidth,
		height: layout.watermarkHeight
	}
}

export function getQrWatermarkFramePosition(corner: WatermarkCorner, layout: QrRenderLayout): QrWatermarkFramePosition {
	const rect = getQrWatermarkRect(corner, layout)
	const frameLeft = layout.framePadding + layout.frameBorder
	const frameTop = layout.framePadding + layout.frameBorder
	const left = rect.x - frameLeft
	const top = rect.y - frameTop
	const right = layout.frameContentSize - left - rect.width
	const bottom = layout.frameContentSize - top - rect.height

	if (corner === 'top-left') {
		return {
			left,
			top
		}
	}
	if (corner === 'top-right') {
		return {
			right,
			top
		}
	}
	if (corner === 'bottom-right') {
		return {
			right,
			bottom
		}
	}
	return {
		left,
		bottom
	}
}
