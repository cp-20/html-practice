from PIL import Image

img = Image.open('img/nc152005.png')
img = img.resize((50, 50))

img = img.convert('RGB')
img.show()
pixels = img.load()

text = ''
style = ''
for y in range(img.size[1]):
	for x in range(img.size[0]):
		color = pixels[x, y]
		text += '%c＋'
		style += ',"color:transparent;background-color:#' + format(color[0], 'x') + format(color[1], 'x') + format(color[2], 'x') + ';"'
	text += '\\n'

with open('output.js', mode='w', encoding='UTF-8') as f:
	f.write('console.log("' + text + '"' + style + ')')