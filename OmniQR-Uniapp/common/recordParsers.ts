export type DetailField = {
	label: string
	value: string
}

function unescapeWifiValue(value: string) {
	return value.replace(/\\([\\;,:])/g, '$1')
}

export function parseWifiPayload(content: string): DetailField[] {
	if (!/^WIFI:/i.test(content.trim())) {
		return []
	}

	const body = content.trim().replace(/^WIFI:/i, '').replace(/;;$/, '')
	const parts: string[] = []
	let current = ''
	let escaping = false

	for (const char of body) {
		if (escaping) {
			current += `\\${char}`
			escaping = false
			continue
		}
		if (char === '\\') {
			escaping = true
			continue
		}
		if (char === ';') {
			parts.push(current)
			current = ''
			continue
		}
		current += char
	}
	if (current) {
		parts.push(current)
	}

	const map: Record<string, string> = {}
	parts.forEach((part) => {
		const index = part.indexOf(':')
		if (index <= 0) {
			return
		}
		map[part.slice(0, index)] = unescapeWifiValue(part.slice(index + 1))
	})

	return [
		{ label: 'WiFi名称', value: map.S || '' },
		{ label: '加密方式', value: map.T === 'nopass' ? '无密码' : map.T || '' },
		{ label: 'WiFi密码', value: map.P || '无' },
		{ label: '隐藏网络', value: map.H === 'true' ? '是' : '否' }
	].filter((field) => field.value)
}

function unescapeVCardValue(value: string) {
	return value.replace(/\\n/g, '\n').replace(/\\([\\,;])/g, '$1')
}

export function parseVCardPayload(content: string): DetailField[] {
	if (!/^BEGIN:VCARD/i.test(content.trim())) {
		return []
	}

	const values: Record<string, string[]> = {}
	content.split(/\r?\n/).forEach((line) => {
		const index = line.indexOf(':')
		if (index <= 0) {
			return
		}
		const key = line.slice(0, index).split(';')[0].toUpperCase()
		const value = unescapeVCardValue(line.slice(index + 1).trim())
		if (!value) {
			return
		}
		values[key] = [...(values[key] || []), value]
	})

	const address = (values.ADR || [])
		.map((value) => value.split(';').filter(Boolean).join(' '))
		.filter(Boolean)
		.join('\n')

	return [
		{ label: '姓名', value: (values.FN || [])[0] || '' },
		{ label: '手机号', value: (values.TEL || []).join('\n') },
		{ label: '公司', value: (values.ORG || [])[0] || '' },
		{ label: '职位', value: (values.TITLE || [])[0] || '' },
		{ label: '邮箱', value: (values.EMAIL || []).join('\n') },
		{ label: '网址', value: (values.URL || []).join('\n') },
		{ label: '地址', value: address },
		{ label: '备注', value: (values.NOTE || [])[0] || '' }
	].filter((field) => field.value)
}

export function parseLinkPayload(content: string): DetailField[] {
	const text = content.trim()
	if (!/^https?:\/\//i.test(text)) {
		return []
	}

	try {
		const url = new URL(text)
		return [
			{ label: '协议', value: url.protocol.replace(':', '') },
			{ label: '域名', value: url.host },
			{ label: '路径', value: url.pathname === '/' ? '/' : decodeURIComponent(url.pathname) },
			{ label: '查询参数', value: url.search ? url.search.slice(1) : '' }
		].filter((field) => field.value)
	} catch (_error) {
		return [{ label: '链接', value: text }]
	}
}

export function getStructuredFields(type: string, content: string): DetailField[] {
	if (type === 'WiFi') {
		return parseWifiPayload(content)
	}
	if (type === '名片') {
		return parseVCardPayload(content)
	}
	if (type === '链接') {
		return parseLinkPayload(content)
	}
	if (type === '文本' || type === '扫码') {
		return [{ label: '内容长度', value: `${content.length} 字符` }]
	}
	return []
}
