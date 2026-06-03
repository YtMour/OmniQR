import qrcode from 'qrcode-generator'

export type QrCell = {
	id: string
	dark: boolean
}

export type QrMatrix = {
	size: number
	cells: QrCell[]
}

export function createQrMatrix(content: string): QrMatrix | null {
	const text = content.trim()
	if (!text) {
		return null
	}

	try {
		const qr = qrcode(0, 'M')
		qr.addData(text)
		qr.make()
		const size = qr.getModuleCount()
		const cells: QrCell[] = []

		for (let row = 0; row < size; row += 1) {
			for (let col = 0; col < size; col += 1) {
				cells.push({
					id: `${row}-${col}`,
					dark: qr.isDark(row, col)
				})
			}
		}

		return {
			size,
			cells
		}
	} catch (_error) {
		return null
	}
}
