import { getSettings, saveSettings, type OmniQrSettings } from './settingsStore'
import { listRecords, type QrRecord } from './recordStore'

const RECORDS_KEY = 'omniqr_records'

type ImportResult = {
	imported: number
	skipped: number
	settingsImported: boolean
}

function isRecordLike(value: unknown): value is Partial<QrRecord> {
	return !!value && typeof value === 'object' && typeof (value as QrRecord).content === 'string'
}

function normalizeRecord(record: Partial<QrRecord>, index: number): QrRecord {
	const now = Date.now()
	const content = String(record.content || '').trim()
	const title = String(record.title || content.slice(0, 16) || '导入记录')
	const type = (record.type || '文本') as QrRecord['type']

	return {
		id: record.id || `import-${now}-${index}`,
		title,
		type,
		content,
		desc: record.desc || (content.length > 32 ? `${content.slice(0, 32)}...` : content),
		favorite: Boolean(record.favorite),
		source: record.source || 'imported',
		createdAt: Number(record.createdAt || now),
		updatedAt: now
	}
}

export function createBackupJson() {
	return JSON.stringify(
		{
			exportedAt: new Date().toISOString(),
			version: 1,
			settings: getSettings(),
			records: listRecords()
		},
		null,
		2
	)
}

export function importBackupJson(jsonText: string): ImportResult {
	const parsed = JSON.parse(jsonText)
	const sourceRecords = Array.isArray(parsed) ? parsed : parsed.records
	if (!Array.isArray(sourceRecords)) {
		throw new Error('records must be an array')
	}

	const existingRecords = listRecords()
	const existingKeys = new Set(existingRecords.map((record) => `${record.type}\n${record.content}`))
	const nextRecords = [...existingRecords]
	let imported = 0
	let skipped = 0

	sourceRecords.forEach((item, index) => {
		if (!isRecordLike(item)) {
			skipped += 1
			return
		}
		const record = normalizeRecord(item, index)
		if (!record.content) {
			skipped += 1
			return
		}
		const key = `${record.type}\n${record.content}`
		if (existingKeys.has(key)) {
			skipped += 1
			return
		}
		existingKeys.add(key)
		nextRecords.unshift(record)
		imported += 1
	})

	uni.setStorageSync(RECORDS_KEY, nextRecords)

	let settingsImported = false
	if (parsed.settings && typeof parsed.settings === 'object') {
		saveSettings({
			...getSettings(),
			...(parsed.settings as Partial<OmniQrSettings>)
		} as OmniQrSettings)
		settingsImported = true
	}

	return {
		imported,
		skipped,
		settingsImported
	}
}

export function downloadJsonFile(filename: string, content: string) {
	if (typeof document === 'undefined') {
		return false
	}

	const blob = new Blob([content], { type: 'application/json;charset=utf-8' })
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.style.display = 'none'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
	return true
}
