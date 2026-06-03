<template>
	<view class="bottom-nav" style="position: fixed; left: 0; right: 0; bottom: 0; min-height: 112rpx; padding-bottom: env(safe-area-inset-bottom); background: rgba(255, 255, 255, 0.98); border-top: 1rpx solid #e5e7eb; display: flex; align-items: center; justify-content: space-around; z-index: 20;">
		<view class="nav-item" :class="{ active: active === 'home' }" style="width: 140rpx; height: 104rpx; display: flex; flex-direction: column; align-items: center; justify-content: center;" @tap="go('/pages/index/index')">
			<image class="nav-icon" src="/static/icons/home.webp" mode="aspectFit" :style="iconStyle('home')"></image>
			<text class="nav-text" :style="textStyle('home')">{{ t('home') }}</text>
		</view>
		<view class="nav-item" :class="{ active: active === 'generate' }" style="width: 140rpx; height: 104rpx; display: flex; flex-direction: column; align-items: center; justify-content: center;" @tap="go('/pages/generate/generate')">
			<image class="nav-icon" src="/static/icons/plus.webp" mode="aspectFit" :style="iconStyle('generate')"></image>
			<text class="nav-text" :style="textStyle('generate')">{{ t('generate') }}</text>
		</view>
		<view class="nav-item" :class="{ active: active === 'records' }" style="width: 140rpx; height: 104rpx; display: flex; flex-direction: column; align-items: center; justify-content: center;" @tap="go('/pages/records/records')">
			<image class="nav-icon" src="/static/icons/records.webp" mode="aspectFit" :style="iconStyle('records')"></image>
			<text class="nav-text" :style="textStyle('records')">{{ t('records') }}</text>
		</view>
	</view>
</template>

<script lang="ts">
	import { t } from '../common/i18n'

	type TabKey = 'home' | 'generate' | 'records'

	export default {
		props: {
			active: {
				type: String,
				default: 'home'
			}
		},
		methods: {
			t,
			go(url: string) {
				uni.reLaunch({ url })
			},
			iconStyle(key: TabKey) {
				return {
					width: '42rpx',
					height: '42rpx',
					opacity: this.active === key ? 1 : 0.58
				}
			},
			textStyle(key: TabKey) {
				return {
					marginTop: '4rpx',
					fontSize: '22rpx',
					lineHeight: 1.2,
					fontWeight: this.active === key ? 650 : 500,
					color: this.active === key ? '#064e4a' : '#667085'
				}
			}
		}
	}
</script>
