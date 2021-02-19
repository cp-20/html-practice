{
	const browser = navigator.userAgent.toLowerCase();
	if (browser.indexOf('msie') != -1 || browser.indexOf('trident') != -1) {
		alert('Internet Explorerでは表示が正しくなされない場合があります', 'うぇーい')
	}
}