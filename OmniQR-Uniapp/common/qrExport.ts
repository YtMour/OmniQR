import { createQrMatrix } from './qrMatrix'

const CANVAS_ID = 'omniqr-export-canvas'
const CANVAS_SIZE = 720
const FRAME_PADDING = 46
const FRAME_RADIUS = 34
const FRAME_WIDTH = 22
const QR_PADDING = 96

function getWatermarkCorners(seed: string): Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> {
	const corners: Array<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'> = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
	let hash = 0
	for (let index = 0; index < seed.length; index += 1) {
		hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
	}
	const first = hash % corners.length
	const second = (first + 1 + (hash % 3)) % corners.length
	return [corners[first], corners[second]]
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

function drawWatermark(ctx: any, corner: string) {
	const text = 'OmniQR'
	const boxWidth = 116
	const boxHeight = 34
	const inset = FRAME_PADDING + FRAME_WIDTH + 18
	const x = corner.includes('right') ? CANVAS_SIZE - inset - boxWidth : inset
	const y = corner.includes('bottom') ? CANVAS_SIZE - inset - boxHeight : inset

	ctx.setFillStyle('#ffffff')
	drawRoundRect(ctx, x, y, boxWidth, boxHeight, 10)
	ctx.fill()
	ctx.setFillStyle('#075e59')
	ctx.setFontSize(22)
	ctx.setTextAlign('center')
	ctx.setTextBaseline('middle')
	ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2)
}

export function exportQrImage(content: string, owner: any): Promise<string> {
	return new Promise((resolve, reject) => {
		const matrix = createQrMatrix(content)
		if (!matrix) {
			reject(new Error('empty qrcode content'))
			return
		}

		const ctx = uni.createCanvasContext(CANVAS_ID, owner)
		ctx.setFillStyle('#f8faf9')
		ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

		ctx.setFillStyle('#ffffff')
		drawRoundRect(ctx, FRAME_PADDING, FRAME_PADDING, CANVAS_SIZE - FRAME_PADDING * 2, CANVAS_SIZE - FRAME_PADDING * 2, FRAME_RADIUS)
		ctx.fill()

		ctx.setStrokeStyle('#075e59')
		ctx.setLineWidth(FRAME_WIDTH)
		drawRoundRect(ctx, FRAME_PADDING + FRAME_WIDTH / 2, FRAME_PADDING + FRAME_WIDTH / 2, CANVAS_SIZE - FRAME_PADDING * 2 - FRAME_WIDTH, CANVAS_SIZE - FRAME_PADDING * 2 - FRAME_WIDTH, FRAME_RADIUS)
		ctx.stroke()

		const qrSize = CANVAS_SIZE - QR_PADDING * 2
		const cellSize = qrSize / matrix.size
		ctx.setFillStyle('#ffffff')
		ctx.fillRect(QR_PADDING - 20, QR_PADDING - 20, qrSize + 40, qrSize + 40)
		ctx.setFillStyle('#111827')
		matrix.cells.forEach((cell, index) => {
			if (!cell.dark) {
				return
			}
			const row = Math.floor(index / matrix.size)
			const col = index % matrix.size
			ctx.fillRect(QR_PADDING + col * cellSize, QR_PADDING + row * cellSize, Math.ceil(cellSize), Math.ceil(cellSize))
		})

		getWatermarkCorners(content).forEach((corner) => drawWatermark(ctx, corner))

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

export function saveQrImageToAlbum(content: string, owner: any): Promise<string> {
	return exportQrImage(content, owner).then((tempFilePath) => {
		return new Promise((resolve, reject) => {
			uni.saveImageToPhotosAlbum({
				filePath: tempFilePath,
				success: () => resolve(tempFilePath),
				fail: reject
			})
		})
	})
}

export const QR_EXPORT_CANVAS_ID = CANVAS_ID
