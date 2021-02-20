{
	const browser = navigator.userAgent.toLowerCase();
	if (browser.indexOf('msie') != -1 || browser.indexOf('trident') != -1) {
		alert('Internet Explorerでは表示が正しくなされない場合があります', 'うぇーい')
	}

	let devtools = function() {};
	devtools.toString = function() {
		if (!this.opened) {
			console.log('%c＋', `color:transparent;font-size:300px;background-repeat:no-repeat;background-size:contain;background-image:url("${location.href.replace(/\/\w+\.html/, '')}/img/logo.png")`);
			console.log('|ω・｀)ﾉ ﾔｧ');
		}
		this.opened = true;
	}

	console.log('%c', devtools);
}