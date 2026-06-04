export type RecordType = 'WiFi' | '名片' | '链接' | '文本' | '扫码'

export type RecordSource = 'generated' | 'scanned' | 'imported'

export type QrRecord = {
	id: string
	title: string
	type: RecordType
	content: string
	desc: string
	styleSeed?: string
	favorite: boolean
	source: RecordSource
	createdAt: number
	updatedAt: number
}

export type NewQrRecord = Omit<QrRecord, 'id' | 'favorite' | 'source' | 'createdAt' | 'updatedAt'> & {
	favorite?: boolean
	source?: RecordSource
}

const STORAGE_KEY = 'omniqr_records'

const now = () => Date.now()

const seedRecords: QrRecord[] = [
	{
		id: 'seed-wifi',
		title: '门店WiFi',
		type: 'WiFi',
		content: 'WIFI:T:WPA;S:OmniQR;P:12345678;H:false;;',
		desc: 'WIFI:T:WPA;S:OmniQR...',
		favorite: true,
		source: 'generated',
		createdAt: now() - 1000 * 60 * 10,
		updatedAt: now() - 1000 * 60 * 10
	},
	{
		id: 'seed-contact',
		title: '个人名片',
		type: '名片',
		content: 'BEGIN:VCARD\nVERSION:3.0\nFN:OmniQR\nEND:VCARD',
		desc: 'BEGIN:VCARD...',
		favorite: true,
		source: 'generated',
		createdAt: now() - 1000 * 60 * 60,
		updatedAt: now() - 1000 * 60 * 60
	},
	{
		id: 'seed-link',
		title: '项目链接',
		type: '链接',
		content: 'https://example.com',
		desc: 'https://example.com',
		favorite: false,
		source: 'generated',
		createdAt: now() - 1000 * 60 * 60 * 2,
		updatedAt: now() - 1000 * 60 * 60 * 2
	}
]

export function listRecords(): QrRecord[] {
	const records = uni.getStorageSync(STORAGE_KEY)
	if (Array.isArray(records)) {
		return records as QrRecord[]
	}
	uni.setStorageSync(STORAGE_KEY, seedRecords)
	return seedRecords
}

export function getRecord(id: string): QrRecord | undefined {
	return listRecords().find((record) => record.id === id)
}

export function addRecord(record: NewQrRecord): QrRecord {
	const records = listRecords()
	const nextRecord: QrRecord = {
		id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
		favorite: false,
		source: 'generated',
		createdAt: now(),
		updatedAt: now(),
		...record
	}
	uni.setStorageSync(STORAGE_KEY, [nextRecord, ...records])
	return nextRecord
}

export function toggleFavorite(id: string): QrRecord[] {
	const records = listRecords().map((record) => {
		if (record.id !== id) {
			return record
		}
		return {
			...record,
			favorite: !record.favorite,
			updatedAt: now()
		}
	})
	uni.setStorageSync(STORAGE_KEY, records)
	return records
}

export function deleteRecord(id: string): QrRecord[] {
	const records = listRecords().filter((record) => record.id !== id)
	uni.setStorageSync(STORAGE_KEY, records)
	return records
}

export function detectRecordType(content: string): RecordType {
	const text = content.trim()
	if (/^WIFI:/i.test(text)) {
		return 'WiFi'
	}
	if (/^BEGIN:VCARD/i.test(text)) {
		return '名片'
	}
	if (/^https?:\/\//i.test(text)) {
		return '链接'
	}
	return '文本'
}
