<template>
	<view class="page" :style="{ paddingTop: safeTop + 'px' }">
		<view class="topbar">
			<image class="back-icon" src="/static/icons/back.webp" mode="aspectFit" @tap="goBack"></image>
			<text class="topbar-title">{{ t('privacyPolicy') }}</text>
			<view class="topbar-spacer"></view>
		</view>

		<view class="policy-card">
			<text class="policy-title">{{ t('privacyPolicyTitle') }}</text>
			<text class="policy-meta">{{ t('privacyPolicyMeta') }}</text>
		</view>

		<view class="policy-card">
			<text class="section-title">{{ t('policy1Title') }}</text>
			<text class="policy-text">{{ t('policy1P1') }}</text>
			<text class="policy-text">{{ t('policy1P2') }}</text>
		</view>

		<view class="policy-card">
			<text class="section-title">{{ t('policy2Title') }}</text>
			<text class="policy-text">{{ t('policy2P1') }}</text>
			<text class="policy-text">{{ t('policy2P2') }}</text>
			<text class="policy-text">{{ t('policy2P3') }}</text>
		</view>

		<view class="policy-card">
			<text class="section-title">{{ t('policy3Title') }}</text>
			<text class="policy-text">{{ t('policy3P1') }}</text>
			<text class="policy-text">{{ t('policy3P2') }}</text>
		</view>

		<view class="policy-card">
			<text class="section-title">{{ t('policy4Title') }}</text>
			<text class="policy-text">{{ t('policy4P1') }}</text>
			<text class="policy-text">{{ t('policy4P2') }}</text>
		</view>

		<view class="policy-card">
			<text class="section-title">{{ t('policy5Title') }}</text>
			<text class="policy-text">{{ t('policy5P1') }}</text>
			<text class="policy-text">{{ t('policy5P2') }}</text>
		</view>

		<view class="policy-card">
			<text class="section-title">{{ t('policy6Title') }}</text>
			<text class="policy-text">{{ t('policy6P1') }}</text>
			<text class="policy-text">{{ t('policy6P2') }}</text>
		</view>

		<view class="policy-card">
			<text class="section-title">{{ t('policy7Title') }}</text>
			<text class="policy-text">{{ t('policy7P1') }}</text>
			<text class="policy-text">{{ t('policy7P2') }}</text>
			<text class="policy-text">{{ t('policy7P3') }}</text>
		</view>
	</view>
</template>

<script lang="ts">
	import { t } from '../../common/i18n'

	export default {
		data() {
			return {
				safeTop: 48
			}
		},
		onLoad() {
			this.safeTop = this.getSafeTop()
		},
		methods: {
			t,
			getSafeTop() {
				const info = uni.getSystemInfoSync()
				return (info.statusBarHeight || 24) + 12
			},
			goBack() {
				uni.navigateBack({
					fail: () => {
						uni.navigateTo({
							url: '/pages/settings/settings'
						})
					}
				})
			}
		}
	}
</script>

<style>
	page {
		background: #f8faf9;
		color: #111827;
	}

	.page {
		min-height: 100vh;
		padding-right: 28rpx;
		padding-bottom: 56rpx;
		padding-left: 28rpx;
		box-sizing: border-box;
		background: #f8faf9;
		display: flex;
		flex-direction: column;
		gap: 22rpx;
	}

	.topbar {
		height: 76rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.topbar-spacer,
	.back-icon {
		width: 64rpx;
		height: 64rpx;
		flex-shrink: 0;
	}

	.topbar-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #111827;
	}

	.policy-card {
		padding: 26rpx;
		border-radius: 18rpx;
		background: #ffffff;
		border: 1rpx solid #d7dee8;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.04);
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.policy-title {
		font-size: 36rpx;
		font-weight: 800;
		line-height: 1.25;
		color: #064e4a;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 750;
		line-height: 1.28;
		color: #111827;
	}

	.policy-meta,
	.policy-text {
		font-size: 26rpx;
		line-height: 1.58;
		color: #475467;
	}

	.policy-text {
		color: #344054;
	}
</style>
