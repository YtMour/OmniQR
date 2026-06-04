import { createQrMatrix } from './qrMatrix'
import { getQrVisualStyle, type WatermarkCorner } from './qrStyle'
import { getQrRenderLayout, getQrWatermarkRect, QR_EXPORT_CANVAS_SIZE } from './qrRenderGeometry'
// #ifdef H5
import { toPng } from 'html-to-image'
// #endif

const CANVAS_ID = 'omniqr-export-canvas'
const CANVAS_SIZE = QR_EXPORT_CANVAS_SIZE
const QR_PREVIEW_EXPORT_SELECTOR = '[data-omniqr-export-root="true"]'

type QrImageSaveOptions = {
	previewElement?: HTMLElement | null
}

function isH5Runtime() {
	return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function getVisibleQrPreviewElement() {
	if (!isH5Runtime()) {
		return null
	}

	const elements = Array.from(document.querySelectorAll(QR_PREVIEW_EXPORT_SELECTOR)) as HTMLElement[]
	const visibleElements = elements.filter((element) => {
		const rect = element.getBoundingClientRect()
		const style = window.getComputedStyle(element)
		return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
	})

	return visibleElements[visibleElements.length - 1] || null
}

function getExportPixelRatio(element: HTMLElement) {
	const rect = element.getBoundingClientRect()
	const baseWidth = Math.max(rect.width, 1)
	return Math.min(4, Math.max(2, CANVAS_SIZE / baseWidth))
}

async function waitForDomExportReady() {
	const fonts = document.fonts
	if (fonts && fonts.ready) {
		await fonts.ready
	}
	await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
}

function drawRoundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
	ctx.beginPath()
	ctx.moveTo(x + radius, y)
	ctx.lineTo(x + width - radius, y)
	ctx.arcTo(x + width, y, x + width, y + radius, radius)
	ctx.lineTo(x + width, y + height - radius)
	ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
	ctx.lineTo(x + radius, y + height)
	ctx.arcTo(x, y + height, x, y + height - radius, radius)
	ctx.lineTo(x, y + radius)
	ctx.arcTo(x, y, x + radius, y, radius)
	ctx.closePath()
}

function setCanvasDash(ctx: any, pattern: number[]) {
	if (typeof ctx.setLineDash === 'function') {
		ctx.setLineDash(pattern, 0)
	}
}

function drawFrameBorder(ctx: any, x: number, y: number, size: number, radius: number, width: number, color: string, dashed: boolean) {
	ctx.setStrokeStyle(color)
	ctx.setLineWidth(width)
	setCanvasDash(ctx, dashed ? [12, 12] : [])
	drawRoundRect(ctx, x + width / 2, y + width / 2, size - width, size - width, radius)
	ctx.stroke()
	setCanvasDash(ctx, [])
}

function drawWatermark(ctx: any, corner: WatermarkCorner, borderColor: string, textColor: string, backgroundColor: string, layout: ReturnType<typeof getQrRenderLayout>) {
	const text = 'OmniQR'
	const rect = getQrWatermarkRect(corner, layout)
	const labelBackground = '#ffffff'
	const labelBorder = '#334155'
	const labelText = '#111827'

	ctx.setFillStyle(labelBackground)
	drawRoundRect(ctx, rect.x, rect.y, rect.width, rect.height, layout.baseSize * 0.011)
	ctx.fill()
	ctx.setStrokeStyle(labelBorder)
	ctx.setLineWidth(Math.max(2, layout.baseSize * 0.003))
	drawRoundRect(ctx, rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, layout.baseSize * 0.01)
	ctx.stroke()
	ctx.setFillStyle(labelText)
	ctx.setFontSize(layout.watermarkFontSize)
	ctx.setTextAlign('center')
	ctx.setTextBaseline('middle')
	const step = rect.width / text.length
	const startX = rect.x + step / 2
	for (let index = 0; index < text.length; index += 1) {
		ctx.fillText(text[index], startX + index * step, rect.y + rect.height / 2)
	}
}

function isFinderCell(row: number, col: number, matrixSize: number) {
	const inTop = row < 7
	const inBottom = row >= matrixSize - 7
	const inLeft = col < 7
	const inRight = col >= matrixSize - 7
	return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft)
}

function drawDiamond(ctx: any, x: number, y: number, size: number) {
	ctx.beginPath()
	ctx.moveTo(x + size / 2, y)
	ctx.lineTo(x + size, y + size / 2)
	ctx.lineTo(x + size / 2, y + size)
	ctx.lineTo(x, y + size / 2)
	ctx.closePath()
	ctx.fill()
}

function drawQrModule(ctx: any, x: number, y: number, size: number, style: string, foregroundColor: string, backgroundColor: string) {
	const drawSize = Math.ceil(size)
	ctx.setFillStyle(foregroundColor)
	if (style === 'soft') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.18)
		ctx.fill()
		return
	}
	if (style === 'dot') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.42)
		ctx.fill()
		return
	}
	if (style === 'tiny') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.1)
		ctx.fill()
		return
	}
	if (style === 'diamond') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.14)
		ctx.fill()
		return
	}
	if (style === 'rounded') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.3)
		ctx.fill()
		return
	}
	if (style === 'plus') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.3)
		ctx.fill()
		return
	}
	if (style === 'slash') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.14)
		ctx.fill()
		return
	}
	if (style === 'vertical') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.1)
		ctx.fill()
		return
	}
	if (style === 'hollow') {
		drawRoundRect(ctx, x, y, drawSize, drawSize, size * 0.1)
		ctx.fill()
		return
	}
	ctx.fillRect(x, y, drawSize, drawSize)
}

function drawFinder(ctx: any, x: number, y: number, size: number, style: string, foregroundColor: string, backgroundColor: string, accentColor: string) {
	const outer = size
	const mid = size * 0.66
	const inner = size * 0.34
	const midOffset = (outer - mid) / 2
	const innerOffset = (outer - inner) / 2
	ctx.setFillStyle(foregroundColor)
	if (style === 'round' || style === 'target') {
		ctx.beginPath()
		ctx.arc(x + outer / 2, y + outer / 2, outer / 2, 0, Math.PI * 2)
		ctx.closePath()
		ctx.fill()
		ctx.setFillStyle(backgroundColor)
		ctx.beginPath()
		ctx.arc(x + outer / 2, y + outer / 2, mid / 2, 0, Math.PI * 2)
		ctx.closePath()
		ctx.fill()
		ctx.setFillStyle(style === 'target' ? accentColor : foregroundColor)
		ctx.beginPath()
		ctx.arc(x + outer / 2, y + outer / 2, inner / 2, 0, Math.PI * 2)
		ctx.closePath()
		ctx.fill()
		return
	}
	if (style === 'diamond') {
		drawDiamond(ctx, x, y, outer)
		ctx.setFillStyle(backgroundColor)
		drawDiamond(ctx, x + midOffset, y + midOffset, mid)
		ctx.setFillStyle(foregroundColor)
		drawDiamond(ctx, x + innerOffset, y + innerOffset, inner)
		return
	}
	if (style === 'bracket') {
		ctx.setStrokeStyle(foregroundColor)
		ctx.setLineWidth(Math.max(4, size * 0.11))
		const l = size * 0.34
		;[
			[x, y, x + l, y],
			[x, y, x, y + l],
			[x + size - l, y, x + size, y],
			[x + size, y, x + size, y + l],
			[x, y + size, x + l, y + size],
			[x, y + size - l, x, y + size],
			[x + size - l, y + size, x + size, y + size],
			[x + size, y + size - l, x + size, y + size]
		].forEach(([x1, y1, x2, y2]) => {
			ctx.beginPath()
			ctx.moveTo(x1, y1)
			ctx.lineTo(x2, y2)
			ctx.stroke()
		})
		ctx.setFillStyle(accentColor)
		drawRoundRect(ctx, x + innerOffset, y + innerOffset, inner, inner, inner * 0.22)
		ctx.fill()
		return
	}
	if (style === 'neon') {
		ctx.setStrokeStyle(accentColor)
		ctx.setLineWidth(Math.max(3, size * 0.08))
		drawRoundRect(ctx, x, y, outer, outer, size * 0.18)
		ctx.stroke()
		drawRoundRect(ctx, x + midOffset, y + midOffset, mid, mid, size * 0.14)
		ctx.stroke()
		ctx.setFillStyle(foregroundColor)
		drawRoundRect(ctx, x + innerOffset, y + innerOffset, inner, inner, size * 0.1)
		ctx.fill()
		return
	}
	if (style === 'leaf') {
		drawRoundRect(ctx, x, y, outer, outer, size * 0.42)
		ctx.fill()
		ctx.setFillStyle(backgroundColor)
		drawRoundRect(ctx, x + midOffset, y + midOffset, mid, mid, size * 0.34)
		ctx.fill()
		ctx.setFillStyle(accentColor)
		drawRoundRect(ctx, x + innerOffset, y + innerOffset, inner, inner, size * 0.28)
		ctx.fill()
		return
	}
	if (style === 'minimal') {
		ctx.setStrokeStyle(foregroundColor)
		ctx.setLineWidth(Math.max(4, size * 0.09))
		drawRoundRect(ctx, x, y, outer, outer, size * 0.08)
		ctx.stroke()
		ctx.setFillStyle(foregroundColor)
		ctx.fillRect(x + innerOffset, y + innerOffset, inner, inner)
		return
	}
	if (style === 'stamp') {
		ctx.fillRect(x, y, outer, outer)
		ctx.setFillStyle(backgroundColor)
		ctx.fillRect(x + midOffset, y + midOffset, mid, mid)
		ctx.setFillStyle(foregroundColor)
		for (let index = 0; index < 4; index += 1) {
			ctx.fillRect(x + index * (outer / 4), y, outer / 8, outer * 0.12)
			ctx.fillRect(x, y + index * (outer / 4), outer * 0.12, outer / 8)
		}
		ctx.fillRect(x + innerOffset, y + innerOffset, inner, inner)
		return
	}
	if (style === 'block') {
		ctx.fillRect(x, y, outer, outer)
		ctx.setFillStyle(backgroundColor)
		ctx.fillRect(x + midOffset, y + midOffset, mid, mid)
		ctx.setFillStyle(accentColor)
		ctx.fillRect(x + innerOffset, y + innerOffset, inner, inner)
		return
	}
	ctx.fillRect(x, y, outer, outer)
	ctx.setFillStyle(backgroundColor)
	ctx.fillRect(x + midOffset, y + midOffset, mid, mid)
	ctx.setFillStyle(foregroundColor)
	ctx.fillRect(x + innerOffset, y + innerOffset, inner, inner)
}

export function exportQrImage(content: string, owner: any, visualSeed = content): Promise<string> {
	return new Promise((resolve, reject) => {
		const matrix = createQrMatrix(content)
		if (!matrix) {
			reject(new Error('empty qrcode content'))
			return
		}

		const visualStyle = getQrVisualStyle(visualSeed || content)
		const foregroundColor = visualStyle.foregroundColor
		const backgroundColor = visualStyle.backgroundColor
		const frameColor = visualStyle.accentColor
		const isDashedFrame = visualStyle.frameStyle === 'corner'
		const layout = getQrRenderLayout(CANVAS_SIZE, visualStyle.frameStyle)
		const ctx = uni.createCanvasContext(CANVAS_ID, owner)
		ctx.setFillStyle(backgroundColor)
		ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

		ctx.setFillStyle(backgroundColor)
		drawRoundRect(ctx, layout.framePadding, layout.framePadding, layout.frameSize, layout.frameSize, layout.frameRadius)
		ctx.fill()

		drawFrameBorder(ctx, layout.framePadding, layout.framePadding, layout.frameSize, layout.frameRadius, layout.frameBorder, frameColor, isDashedFrame)

		const cellSize = layout.qrBoxSize / matrix.size
		ctx.setFillStyle(backgroundColor)
		ctx.fillRect(
			layout.framePadding + layout.frameBorder + layout.matrixBoxInset,
			layout.framePadding + layout.frameBorder + layout.matrixBoxInset,
			layout.matrixBoxSize,
			layout.matrixBoxSize
		)
		ctx.setFillStyle(foregroundColor)
		matrix.cells.forEach((cell, index) => {
			if (!cell.dark) {
				return
			}
			const row = Math.floor(index / matrix.size)
			const col = index % matrix.size
			if (isFinderCell(row, col, matrix.size)) {
				return
			}
			drawQrModule(ctx, layout.qrStart + col * cellSize, layout.qrStart + row * cellSize, cellSize, visualStyle.moduleStyle, foregroundColor, backgroundColor)
		})
		const finderSize = cellSize * 7
		drawFinder(ctx, layout.qrStart, layout.qrStart, finderSize, visualStyle.finderStyle, foregroundColor, backgroundColor, frameColor)
		drawFinder(ctx, layout.qrStart + (matrix.size - 7) * cellSize, layout.qrStart, finderSize, visualStyle.finderStyle, foregroundColor, backgroundColor, frameColor)
		drawFinder(ctx, layout.qrStart, layout.qrStart + (matrix.size - 7) * cellSize, finderSize, visualStyle.finderStyle, foregroundColor, backgroundColor, frameColor)

		drawFrameBorder(ctx, layout.framePadding, layout.framePadding, layout.frameSize, layout.frameRadius, layout.frameBorder, frameColor, isDashedFrame)
		drawWatermark(ctx, visualStyle.watermarkCorner, frameColor, foregroundColor, backgroundColor, layout)

		ctx.draw(false, () => {
			uni.canvasToTempFilePath(
				{
					canvasId: CANVAS_ID,
					width: CANVAS_SIZE,
					height: CANVAS_SIZE,
					destWidth: CANVAS_SIZE,
					destHeight: CANVAS_SIZE,
					fileType: 'png',
					success: (res) => resolve(res.tempFilePath),
					fail: reject
				},
				owner
			)
		})
	})
}

export async function exportQrPreviewElementToPng(previewElement?: HTMLElement | null): Promise<string> {
	// #ifdef H5
	if (!isH5Runtime()) {
		throw new Error('qr preview dom export is only available in h5')
	}

	const element = previewElement || getVisibleQrPreviewElement()
	if (!element) {
		throw new Error('qr preview element not found')
	}

	await waitForDomExportReady()
	return toPng(element, {
		backgroundColor: window.getComputedStyle(element).backgroundColor || '#ffffff',
		cacheBust: true,
		pixelRatio: getExportPixelRatio(element)
	})
	// #endif

	// #ifndef H5
	throw new Error('qr preview dom export is only available in h5')
	// #endif
}

export function exportQrPreviewImage(content: string, owner: any, visualSeed = content, options: QrImageSaveOptions = {}): Promise<string> {
	if (isH5Runtime()) {
		return exportQrPreviewElementToPng(options.previewElement)
	}

	return exportQrImage(content, owner, visualSeed)
}

export function saveQrImageToAlbum(content: string, owner: any, visualSeed = content, filename = `omniqr-${Date.now()}.png`, options: QrImageSaveOptions = {}): Promise<string> {
	if (isH5Runtime()) {
		return exportQrPreviewImage(content, owner, visualSeed, options).then((dataUrl) => {
			downloadQrImageFile(filename, dataUrl)
			return dataUrl
		})
	}

	return exportQrImage(content, owner, visualSeed).then((tempFilePath) => {
		return new Promise((resolve, reject) => {
			uni.saveImageToPhotosAlbum({
				filePath: tempFilePath,
				success: () => resolve(tempFilePath),
				fail: reject
			})
		})
	})
}

export function downloadQrImageFile(filename: string, tempFilePath: string) {
	if (!isH5Runtime()) {
		return false
	}

	const link = document.createElement('a')
	link.href = tempFilePath
	link.download = filename
	link.style.display = 'none'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	return true
}

export const QR_EXPORT_CANVAS_ID = CANVAS_ID
