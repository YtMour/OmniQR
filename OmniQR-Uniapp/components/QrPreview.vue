<template>
	<view class="qr-preview">
		<view v-if="matrix" class="omniqr-preview-frame">
			<text v-for="mark in watermarkMarks" :key="mark" class="omniqr-preview-watermark" :class="mark">OmniQR</text>
			<view class="omniqr-preview-matrix" :style="matrixStyle">
				<view v-for="cell in matrix.cells" :key="cell.id" class="omniqr-preview-cell" :class="{ dark: cell.dark }"></view>
			</view>
		</view>
		<view v-else class="omniqr-preview-empty">
			<image class="omniqr-preview-empty-icon" src="/static/icons/generate.webp" mode="aspectFit"></image>
			<text class="omniqr-preview-empty-text">{{ t('qrPreviewEmpty') }}</text>
		</view>
	</view>
</template>

<script lang="ts">
	import { t } from '../common/i18n'
	import { createQrMatrix } from '../common/qrMatrix'

	export default {
		props: {
			content: {
				type: String,
				default: ''
			},
			watermarkSeed: {
				type: String,
				default: ''
			}
		},
		methods: {
			t
		},
		computed: {
			matrix() {
				return createQrMatrix(this.content)
			},
			matrixStyle() {
				const matrix = this.matrix
				const size = matrix ? matrix.size : 1
				return {
					gridTemplateColumns: `repeat(${size}, 1fr)`,
					gridTemplateRows: `repeat(${size}, 1fr)`
				}
			},
			watermarkMarks() {
				const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
				const seed = this.watermarkSeed || this.content || 'omniqr'
				let hash = 0
				for (let index = 0; index < seed.length; index += 1) {
					hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
				}
				const first = hash % corners.length
				const second = (first + 1 + (hash % 3)) % corners.length
				return [corners[first], corners[second]]
			}
		}
	}
</script>

<style>
	.qr-preview {
		width: 272rpx;
		height: 272rpx;
		border-radius: 22rpx;
		background: #f8fafc;
		border: 1rpx dashed #b8c4d0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.omniqr-preview-frame {
		position: relative;
		width: 248rpx;
		height: 248rpx;
		border-radius: 20rpx;
		background: #ffffff;
		border: 8rpx solid #075e59;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.omniqr-preview-matrix {
		width: 196rpx;
		height: 196rpx;
		padding: 8rpx;
		background: #ffffff;
		display: grid;
		box-sizing: border-box;
	}

	.omniqr-preview-watermark {
		position: absolute;
		font-size: 14rpx;
		font-weight: 800;
		line-height: 1;
		color: #075e59;
		background: #ffffff;
		border-radius: 6rpx;
		padding: 2rpx 4rpx;
		z-index: 2;
	}

	.omniqr-preview-watermark.top-left {
		top: 8rpx;
		left: 8rpx;
	}

	.omniqr-preview-watermark.top-right {
		top: 8rpx;
		right: 8rpx;
	}

	.omniqr-preview-watermark.bottom-left {
		bottom: 8rpx;
		left: 8rpx;
	}

	.omniqr-preview-watermark.bottom-right {
		right: 8rpx;
		bottom: 8rpx;
	}

	.omniqr-preview-cell {
		background: #ffffff;
	}

	.omniqr-preview-cell.dark {
		background: #111827;
	}

	.omniqr-preview-empty {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.omniqr-preview-empty-icon {
		width: 76rpx;
		height: 76rpx;
	}

	.omniqr-preview-empty-text {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #667085;
	}
</style>
