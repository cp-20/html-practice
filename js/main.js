// 表示言語変更
document.getElementById('setting-language').onchange = function() {
	if (this.value === 'ja') {
		// 日本語
		window.location.href = './index.html'
	}else {
		// 他の言語
		window.location.href = `./index-${this.value}.html`
	}
}
