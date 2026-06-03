<script lang="ts">
	import { syncLanguage } from './common/i18n'

	export default {
		onLaunch() {
			syncLanguage()
		},
		onShow() {
			syncLanguage()
		},
		onHide() {}
	}
</script>

<style>
	@import './common/styles/base.css';
	@import './common/styles/layout.css';
	@import './common/styles/components.css';
</style>
