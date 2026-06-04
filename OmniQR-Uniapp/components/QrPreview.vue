<template>
	<view class="qr-preview" :class="{ 'is-clickable': matrix }" :style="previewStyle" @tap="openZoom">
		<view v-if="matrix" class="omniqr-preview-export" data-omniqr-export-root="true" :style="previewExportStyle">
			<view class="omniqr-preview-frame" :class="[visualStyle.frameStyle, visualStyle.theme, `variant-${visualStyle.variant}`]" :style="previewFrameStyle">
				<text v-for="mark in watermarkMarks" :key="mark" class="omniqr-preview-watermark" :class="mark" :style="previewWatermarkStyle">OmniQR</text>
				<view class="omniqr-preview-matrix" :style="previewMatrixStyle">
					<view v-for="cell in matrix.cells" :key="cell.id" class="omniqr-preview-cell" :style="getCellStyle(cell)"></view>
					<view v-for="finder in finderMarks" :key="finder" class="omniqr-preview-finder" :class="[finder, visualStyle.finderStyle]" :style="getFinderStyle(finder)">
						<view class="omniqr-preview-finder-mid" :style="{ background: colors.background }"></view>
						<view class="omniqr-preview-finder-core" :style="{ background: finderCoreColor }"></view>
					</view>
				</view>
			</view>
		</view>
		<view v-else class="omniqr-preview-empty">
			<image class="omniqr-preview-empty-icon" src="/static/icons/generate.webp" mode="aspectFit"></image>
			<text class="omniqr-preview-empty-text">{{ t('qrPreviewEmpty') }}</text>
		</view>
		<view v-if="matrix && isZoomOpen" class="omniqr-preview-zoom" @tap.stop="closeZoom">
			<view class="omniqr-preview-zoom-panel" @tap.stop>
				<view class="omniqr-preview-zoom-head">
					<text class="omniqr-preview-zoom-title">{{ t('qrPreview') }}</text>
					<text class="omniqr-preview-zoom-close" @tap.stop="closeZoom">×</text>
				</view>
				<view class="omniqr-preview-zoom-stage">
					<view class="omniqr-preview-export omniqr-preview-export-large" :style="zoomExportStyle">
						<view class="omniqr-preview-frame omniqr-preview-frame-large" :class="[visualStyle.frameStyle, visualStyle.theme, `variant-${visualStyle.variant}`]" :style="zoomFrameStyle">
							<text v-for="mark in watermarkMarks" :key="`zoom-${mark}`" class="omniqr-preview-watermark" :class="mark" :style="zoomWatermarkStyle">OmniQR</text>
							<view class="omniqr-preview-matrix" :style="zoomMatrixStyle">
								<view v-for="cell in matrix.cells" :key="`zoom-${cell.id}`" class="omniqr-preview-cell" :style="getCellStyle(cell)"></view>
								<view v-for="finder in finderMarks" :key="`zoom-${finder}`" class="omniqr-preview-finder" :class="[finder, visualStyle.finderStyle]" :style="getFinderStyle(finder)">
									<view class="omniqr-preview-finder-mid" :style="{ background: colors.background }"></view>
									<view class="omniqr-preview-finder-core" :style="{ background: finderCoreColor }"></view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	import { t } from '../common/i18n'
	import { createQrMatrix } from '../common/qrMatrix'
	import { getSettings } from '../common/settingsStore'
	import { getQrVisualStyle } from '../common/qrStyle'
	import { getQrPreviewSizeRpx, getQrRenderLayout, getQrWatermarkFramePosition } from '../common/qrRenderGeometry'

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
		data() {
			return {
				isZoomOpen: false
			}
		},
		methods: {
			t,
			rpx(value) {
				return `${Number(value.toFixed(3))}rpx`
			},
			openZoom() {
				if (!this.matrix) {
					return
				}
				this.isZoomOpen = true
			},
			closeZoom() {
				this.isZoomOpen = false
			},
			isFinderCell(row, col) {
				const matrix = this.matrix
				if (!matrix) {
					return false
				}
				const inTop = row < 7
				const inBottom = row >= matrix.size - 7
				const inLeft = col < 7
				const inRight = col >= matrix.size - 7
				return (inTop && inLeft) || (inTop && inRight) || (inBottom && inLeft)
			},
			getCellStyle(cell) {
				const [rowText, colText] = cell.id.split('-')
				const row = Number(rowText)
				const col = Number(colText)
				const style = {
					background: cell.dark ? this.colors.foreground : 'transparent',
					gridColumnStart: col + 1,
					gridRowStart: row + 1
				}
				if (!cell.dark || this.isFinderCell(row, col)) {
					return style
				}
				const moduleStyle = this.visualStyle.moduleStyle
				if (moduleStyle === 'soft') {
					return { ...style, borderRadius: '18%' }
				}
				if (moduleStyle === 'dot') {
					return { ...style, borderRadius: '42%' }
				}
				if (moduleStyle === 'tiny') {
					return { ...style, borderRadius: '10%' }
				}
				if (moduleStyle === 'diamond') {
					return { ...style, borderRadius: '14%' }
				}
				if (moduleStyle === 'rounded') {
					return { ...style, borderRadius: '30%' }
				}
				if (moduleStyle === 'plus') {
					return { ...style, borderRadius: '30%' }
				}
				if (moduleStyle === 'slash') {
					return { ...style, borderRadius: '14%' }
				}
				if (moduleStyle === 'vertical') {
					return { ...style, borderRadius: '10%' }
				}
				if (moduleStyle === 'hollow') {
					return { ...style, borderRadius: '10%' }
				}
				return {
					...style
				}
			},
			getFinderStyle(finder) {
				const matrix = this.matrix
				const size = matrix ? matrix.size : 21
				const unit = 100 / size
				const finderSize = `${unit * 7}%`
				const style = {
					background: this.colors.foreground,
					color: this.colors.foreground,
					borderColor: this.colors.foreground,
					width: finderSize,
					height: finderSize
				}
				if (finder === 'top-left') {
					return { ...style, left: 0, top: 0 }
				}
				if (finder === 'top-right') {
					return { ...style, right: 0, top: 0 }
				}
				return { ...style, left: 0, bottom: 0 }
			},
			getFrameStyle(layout) {
				const borderStyle = this.visualStyle.frameStyle === 'corner' ? 'dashed' : 'solid'
				return {
					width: this.rpx(layout.frameSize),
					height: this.rpx(layout.frameSize),
					background: this.colors.background,
					borderColor: this.colors.frame,
					color: this.colors.frame,
					borderWidth: this.rpx(layout.frameBorder),
					borderStyle,
					borderRadius: this.rpx(layout.frameRadius),
					boxShadow: 'none'
				}
			},
			getExportStyle(layout) {
				return {
					width: this.rpx(layout.baseSize),
					height: this.rpx(layout.baseSize),
					background: this.colors.background
				}
			},
			getMatrixStyle(layout) {
				const matrix = this.matrix
				const size = matrix ? matrix.size : 1
				return {
					width: this.rpx(layout.matrixBoxSize),
					height: this.rpx(layout.matrixBoxSize),
					padding: this.rpx(layout.matrixPadding),
					gridTemplateColumns: `repeat(${size}, 1fr)`,
					gridTemplateRows: `repeat(${size}, 1fr)`,
					background: this.colors.background
				}
			},
			getWatermarkStyle(layout) {
				const position = getQrWatermarkFramePosition(this.visualStyle.watermarkCorner, layout)
				const style = {
					width: this.rpx(layout.watermarkWidth),
					height: this.rpx(layout.watermarkHeight),
					fontSize: this.rpx(layout.watermarkFontSize),
					letterSpacing: this.rpx(layout.watermarkLetterSpacing),
					color: '#111827',
					background: '#ffffff',
					borderColor: '#334155'
				}
				Object.keys(position).forEach((key) => {
					style[key] = this.rpx(position[key])
				})
				return style
			}
		},
		computed: {
			matrix() {
				return createQrMatrix(this.content)
			},
			colors() {
				const style = getQrVisualStyle(this.watermarkSeed || this.content || 'omniqr')
				return {
					foreground: style.foregroundColor,
					background: style.backgroundColor,
					frame: style.accentColor
				}
			},
			visualStyle() {
				return getQrVisualStyle(this.watermarkSeed || this.content || 'omniqr')
			},
			previewStyle() {
				const settings = getSettings()
				const size = getQrPreviewSizeRpx(settings.qrSize)
				return {
					width: this.rpx(size),
					height: this.rpx(size)
				}
			},
			previewLayout() {
				const settings = getSettings()
				return getQrRenderLayout(getQrPreviewSizeRpx(settings.qrSize), this.visualStyle.frameStyle)
			},
			zoomLayout() {
				return getQrRenderLayout(640, this.visualStyle.frameStyle)
			},
			previewFrameStyle() {
				return this.getFrameStyle(this.previewLayout)
			},
			previewExportStyle() {
				return this.getExportStyle(this.previewLayout)
			},
			zoomFrameStyle() {
				return this.getFrameStyle(this.zoomLayout)
			},
			zoomExportStyle() {
				return this.getExportStyle(this.zoomLayout)
			},
			previewMatrixStyle() {
				return this.getMatrixStyle(this.previewLayout)
			},
			zoomMatrixStyle() {
				return this.getMatrixStyle(this.zoomLayout)
			},
			previewWatermarkStyle() {
				return this.getWatermarkStyle(this.previewLayout)
			},
			zoomWatermarkStyle() {
				return this.getWatermarkStyle(this.zoomLayout)
			},
			finderCoreColor() {
				return this.visualStyle.finderStyle === 'target' || this.visualStyle.finderStyle === 'leaf' || this.visualStyle.finderStyle === 'block' ? this.colors.frame : this.colors.foreground
			},
			finderMarks() {
				return ['top-left', 'top-right', 'bottom-left']
			},
			quietZoneModules() {
				return 0
			},
			watermarkMarks() {
				return [this.visualStyle.watermarkCorner]
			},
			cellStyle() {
				return {}
			}
		}
	}
</script>

<style>
	.qr-preview {
		position: relative;
		border-radius: 22rpx;
		background: #f8fafc;
		border: 1rpx dashed #b8c4d0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.qr-preview.is-clickable {
		cursor: pointer;
	}

	.omniqr-preview-export {
		position: relative;
		width: 100%;
		height: 100%;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		overflow: hidden;
	}

	.omniqr-preview-export-large {
		flex: none;
	}

	.omniqr-preview-frame {
		position: relative;
		width: 98%;
		height: 98%;
		border-radius: 20rpx;
		background: #ffffff;
		border: 8rpx solid #075e59;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.omniqr-preview-frame-large {
		width: min(86vw, 640rpx);
		height: min(86vw, 640rpx);
		flex: none;
	}

	.omniqr-preview-matrix {
		position: relative;
		width: 92%;
		height: 92%;
		padding: 4%;
		display: grid;
		box-sizing: border-box;
		z-index: 1;
	}

	.omniqr-preview-frame.neon {
		box-shadow: 0 0 0 3rpx rgba(34, 211, 238, 0.16);
	}

	.omniqr-preview-finder {
		position: absolute;
		width: 31.8%;
		height: 31.8%;
		z-index: 1;
		background: currentColor;
	}

	.omniqr-preview-finder.top-left {
		left: 0;
		top: 0;
	}

	.omniqr-preview-finder.top-right {
		right: 0;
		top: 0;
	}

	.omniqr-preview-finder.bottom-left {
		left: 0;
		bottom: 0;
	}

	.omniqr-preview-finder-mid,
	.omniqr-preview-finder-core {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.omniqr-preview-finder-mid {
		width: 66%;
		height: 66%;
	}

	.omniqr-preview-finder-core {
		width: 34%;
		height: 34%;
	}

	.omniqr-preview-finder.round,
	.omniqr-preview-finder.round .omniqr-preview-finder-mid,
	.omniqr-preview-finder.round .omniqr-preview-finder-core,
	.omniqr-preview-finder.target,
	.omniqr-preview-finder.target .omniqr-preview-finder-mid,
	.omniqr-preview-finder.target .omniqr-preview-finder-core {
		border-radius: 50%;
	}

	.omniqr-preview-finder.diamond {
		transform: rotate(45deg) scale(0.86);
	}

	.omniqr-preview-finder.diamond .omniqr-preview-finder-mid,
	.omniqr-preview-finder.diamond .omniqr-preview-finder-core {
		transform: translate(-50%, -50%);
	}

	.omniqr-preview-finder.bracket {
		background: transparent !important;
		border: 6rpx solid currentColor;
		box-sizing: border-box;
	}

	.omniqr-preview-finder.bracket .omniqr-preview-finder-mid {
		display: none;
	}

	.omniqr-preview-finder.neon {
		background: transparent !important;
		border: 4rpx solid currentColor;
		box-shadow: inset 0 0 0 5rpx currentColor;
		box-sizing: border-box;
	}

	.omniqr-preview-finder.leaf,
	.omniqr-preview-finder.leaf .omniqr-preview-finder-mid,
	.omniqr-preview-finder.leaf .omniqr-preview-finder-core {
		border-radius: 36%;
	}

	.omniqr-preview-finder.minimal {
		background: transparent !important;
		border: 5rpx solid currentColor;
		box-sizing: border-box;
	}

	.omniqr-preview-finder.minimal .omniqr-preview-finder-mid {
		display: none;
	}

	.omniqr-preview-finder.stamp {
		clip-path: polygon(0 10%, 10% 10%, 10% 0, 25% 0, 25% 10%, 40% 10%, 40% 0, 55% 0, 55% 10%, 70% 10%, 70% 0, 85% 0, 85% 10%, 100% 10%, 100% 100%, 0 100%);
	}

	.omniqr-preview-finder.block {
		border-radius: 4rpx;
	}

	.omniqr-preview-watermark {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 11rpx;
		font-weight: 900;
		line-height: 1;
		color: #075e59;
		background: #ffffff;
		border: 1rpx solid currentColor;
		border-radius: 5rpx;
		padding: 0;
		box-sizing: border-box;
		z-index: 3;
		box-shadow: 0 1rpx 3rpx rgba(15, 23, 42, 0.18);
		opacity: 1;
		transform-origin: center;
		pointer-events: none;
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

	.omniqr-preview-zoom {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 34rpx;
		background: rgba(15, 23, 42, 0.58);
		box-sizing: border-box;
	}

	.omniqr-preview-zoom-panel {
		width: min(92vw, 720rpx);
		padding: 22rpx;
		border-radius: 18rpx;
		background: #ffffff;
		box-shadow: 0 20rpx 70rpx rgba(15, 23, 42, 0.28);
		box-sizing: border-box;
	}

	.omniqr-preview-zoom-head {
		height: 52rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.omniqr-preview-zoom-title {
		font-size: 28rpx;
		font-weight: 700;
		line-height: 1.2;
		color: #111827;
	}

	.omniqr-preview-zoom-close {
		width: 48rpx;
		height: 48rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 38rpx;
		line-height: 1;
		color: #475467;
		background: #f1f5f9;
	}

	.omniqr-preview-zoom-stage {
		margin-top: 18rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
