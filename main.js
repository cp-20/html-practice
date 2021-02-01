// Response for Uptime Robot
const func = require('./func.js');

// Discord bot implements
const discord = require('discord.js');
const client = new discord.Client();

console.log('start')
client.on('ready', () => {
	console.log('bot is ready!');
})

// .last()
if (!Array.prototype.last) Array.prototype.last = function () { return this[this.length - 1] }
// .replaceAt()
if (!String.prototype.replaceAt) String.prototype.replaceAt = function (begin, end, to) { return this.slice(0, begin) + to + this.slice(end + 1) }

client.on('message', message => {
	// 自分自身には応答しない
	if (message.author === client.user) return

	// prefix検知
	const patterns = {
		help: /^\/help/,
		CC: /^CC(\(-?\d+\))?<=([\(\)\+-\\\*\d]+)+/i,
		CBR: /^CBR\(([\(\)\+-\\\*\d]+)(,[\(\)\+-\\\*\d]+)+\)/i,
		FAR: /^FAR\(([\(\)\+-\\\*\d]+)(,([\(\)\+-\\\*\d]+))(,([\(\)\+-\\\*\d]+))(,([\(\)\+-\\\*\d]+)?)?(,([rhe]?))?(,([\(\)\+-\\\*\d]+))?\)/i,
		TM: /^TM(\s+all)?$/i,
		BMR: /^BMR(\s+all)?$/i,
		BMS: /^BMS(\s+all)?$/i,
		PH: /^PH(\s+all)?$/i,
		MA: /^MA(\s+all)?$/i,
		FCL: /^FCL(\s+all)?$/i,
		FCM: /^FCM(\s+all)?$/i,
		dice: /^([\(\)\+\-\\\*\dd]+)([<>]=)?([\(\)\+\-\\\*\d]+)?/i,
		simple: /^d66/i
	}

	const utilList = {
		BMR: [
			{ name: '健忘症', content: '探索者は、最後に安全な場所にいた時からあとに起こった出来事の記憶を持たない。例えば、朝食を食べていた次の瞬間には怪物と向かい合っている。これは1D10ラウンド続く。' },
			{ name: '身体症状症', content: '探索者は1D10ラウンドの間、狂気によって視覚や聴覚に異常が生じたり、四肢の1つまたは複数が動かなくなる。' },
			{ name: '暴力衝動', content: '赤い霧が探索者に降り、1D10ラウンドの間、抑えの利かない暴力と破壊を敵味方を問わず周囲に向かって爆発させる。' },
			{ name: '偏執症', content: '探索者は1D10ラウンドの間、重い偏執症に襲われる。誰もが探索者に襲い掛かろうとしている。信用できる者はいない。監視されている。裏切ったやつがいる。これはわなだ。' },
			{ name: '重要な人々', content: '探索者のバックストーリーの重要な人々を見直す。探索者はその場にいた人物を、自分にとっての重要な人々だと思い込む。人間関係の性質を考慮した上で、探索者はそれに従って行動する。1D10ラウンド続く。' },
			{ name: '失神', content: '探索者は失神する。1D10ラウンド後に回復する。' },
			{ name: 'パニックになって逃亡する', content: '探索者は利用できるあらゆる手段を使って、可能なかぎり遠くへ逃げ出さずにはいられない。それが唯一の車両を奪って仲間を置き去りにすることであっても。探索者は1D10ラウンドの間、逃げ続ける。' },
			{ name: '身体的ヒステリーもしくは感情爆発', content: '探索者は1D10ラウンドの間、笑ったり、泣いたり、あるいは叫んだりし続け、行動できなくなる。' },
			{ name: '恐怖症', content: '探索者は新しい恐怖症に陥る。恐怖症表（PHコマンド）をロールするか、キーパーが恐怖症を1つ選ぶ。恐怖症の原因は存在しなくとも、その探索者は次の1D10ラウンドの間、それがそこにあると思い込む。' },
			{ name: 'マニア', content: '探索者は新しいマニアに陥る。マニア表（MAコマンド）をロールするか、キーパーがマニアを1つ選ぶ。その探索者は次の1D10ラウンドの間、自分の新しいマニアに没頭しようとする。' },
		],
		BMS: [
			{ name: '健忘症', content: '探索者が意識を取り戻すと、見知らぬ場所におり、自分が誰かもわからない。記憶は時間をかけてゆっくりと戻るだろう。' },
			{ name: '盗難', content: '探索者は1D10時間後に意識を取り戻すが、盗難の被害を受けている。傷つけられてはいない。探索者が秘蔵の品を身に着けていた場合（「探索者のバックストーリー」参照）、〈幸運〉ロールを行い、それが盗まれていないか判定する。値打ちのあるものはすべて自動的に失われる。' },
			{ name: '暴行', content: '探索者は1D10時間後に意識を取り戻し、自分が暴行を受け、傷ついていることに気づく。耐久力は狂気に陥る前の半分に減少している。ただし重症は生じていない。盗まれたものはない。どのようにダメージが加えられたかは、キーパーに委ねられる。' },
			{ name: '暴力', content: '探索者は暴力と破壊の噴流を爆発させる。探索者が意識を取り戻した時、その行動を認識し記憶していることもあればそうでないこともある。探索者が暴力を振るった物、もしくは人、そして相手を殺してしまったのか、あるいは単に傷つけただけなのかはキーパーに委ねられる。' },
			{ name: 'イデオロギー／信念', content: '探索者のバックストーリーのイデオロギーと信念を参照する。探索者はこれらの1つの権化となり、急進的かつ狂気じみて、感情もあらわに主張するようになる。例えば、宗教に関係する者は、その後地下鉄で声高に福音を説教しているところを目撃されるかもしれない。' },
			{ name: '重要な人々', content: '探索者のバックストーリーの重要な人々を参照し、なぜその人物との関係が重要かを考える。時間がたってから（1D10時間以上）、探索者はその人物に近づくための最善の行動、そしてその人物との関係にとって最善の行動をとる。' },
			{ name: '収容', content: '探索者は精神療養施設あるいは警察の留置所で意識を取り戻す。探索者は徐々にそこにいたった出来事を思い出すかもしれない。' },
			{ name: 'パニック', content: '探索者は非常に遠い場所で意識を取り戻す。荒野で道に迷っているか、列車に乗っているか、長距離バスに乗っているかもしれない。' },
			{ name: '恐怖症', content: '探索者は新たな恐怖症を獲得する。恐怖症表（PHコマンド）をロールするか、キーパーがどれか1つ選ぶ。探索者は1D10時間後に意識を取り戻し、この新たな恐怖症の対象を避けるためにあらゆる努力をする。' },
			{ name: 'マニア', content: '探索者は新たなマニアを獲得する。マニア表（MAコマンド）をロールするか、キーパーがどれか1つ選ぶ。この狂気の発作の間、探索者はこの新たなマニアに完全に溺れているだろう。これがほかの人々に気づかれるかどうかは、キーパーとプレイヤーに委ねられる。' },
		],
		PH: [
			{ name: '入浴恐怖症', content: '体、手、顔を洗うのが怖い' },
			{ name: '高所恐怖症', content: '高い所が怖い' },
			{ name: '飛行恐怖症', content: '飛ぶのが怖い' },
			{ name: '広場恐怖症', content: '広場、公共の（混雑した）場所が怖い' },
			{ name: '鶏肉恐怖症', content: '鶏肉が怖い' },
			{ name: 'ニンニク恐怖症', content: 'ニンニクが怖い' },
			{ name: '乗車恐怖症', content: '車両の中にいたり車両に乗るのが怖い' },
			{ name: '風恐怖症', content: '風が怖い' },
			{ name: '男性恐怖症', content: '男性が怖い' },
			{ name: 'イングランド恐怖症', content: 'イングランド、もしくはイングランド文化などが怖い' },
			{ name: '花恐怖症', content: '花が怖い' },
			{ name: '切断恐怖症', content: '手足や指などが切断された人が怖い' },
			{ name: 'クモ恐怖症', content: 'クモが怖い' },
			{ name: '稲妻恐怖症', content: '稲妻が怖い' },
			{ name: '廃墟恐怖症', content: '廃墟が怖い' },
			{ name: '笛恐怖症', content: '笛（フルート）が怖い' },
			{ name: '細菌恐怖症', content: '細菌、バクテリアが怖い' },
			{ name: '銃弾恐怖症', content: '投擲物や銃弾が怖い' },
			{ name: '落下恐怖症', content: '落下が怖い' },
			{ name: '書物恐怖症', content: '本が怖い' },
			{ name: '植物恐怖症', content: '植物が怖い' },
			{ name: '美女恐怖症', content: '美しい女性が怖い' },
			{ name: '低温恐怖症', content: '冷たいものが怖い' },
			{ name: '時計恐怖症', content: '時計が怖い' },
			{ name: '閉所恐怖症', content: '壁に囲まれた場所が怖い' },
			{ name: '道化師恐怖症', content: '道化師が怖い' },
			{ name: '犬恐怖症', content: '犬が怖い' },
			{ name: '悪魔恐怖症', content: '悪魔が怖い' },
			{ name: '群衆恐怖症', content: '人混みが怖い' },
			{ name: '歯科医恐怖症', content: '歯科医が怖い' },
			{ name: '処分恐怖症', content: '物を捨てるのが怖い（ため込み症）' },
			{ name: '毛皮恐怖症', content: '毛皮が怖い' },
			{ name: '横断恐怖症', content: '道路を横断するが怖い' },
			{ name: '教会恐怖症', content: '教会が怖い' },
			{ name: '鏡恐怖症', content: '鏡が怖い' },
			{ name: 'ピン恐怖症', content: '針やピンが怖い' },
			{ name: '昆虫恐怖症', content: '昆虫が怖い' },
			{ name: '猫恐怖症', content: '猫が怖い' },
			{ name: '橋恐怖症', content: '橋を渡るのが怖い' },
			{ name: '老人恐怖症', content: '老人や年を取るのが怖い' },
			{ name: '女性恐怖症', content: '女性が怖い' },
			{ name: '血液恐怖症', content: '血が怖い' },
			{ name: '過失恐怖症', content: '失敗が怖い' },
			{ name: '接触恐怖症', content: '触ることが怖い' },
			{ name: '爬虫類恐怖症', content: '爬虫類が怖い' },
			{ name: '霧恐怖症', content: '霧が怖い' },
			{ name: '銃器恐怖症', content: '銃器が怖い' },
			{ name: '水恐怖症', content: '水が怖い' },
			{ name: '睡眠恐怖症', content: '眠ったり、催眠状態に陥るのが怖い' },
			{ name: '医師恐怖症', content: '医師が怖い' },
			{ name: '魚恐怖症', content: '魚が怖い' },
			{ name: 'ゴキブリ恐怖症', content: 'ゴキブリが怖い' },
			{ name: '雷鳴恐怖症', content: '雷鳴が怖い' },
			{ name: '野菜恐怖症', content: '野菜が怖い' },
			{ name: '大騒音恐怖症', content: '大きな騒音が怖い' },
			{ name: '湖恐怖症', content: '湖が怖い' },
			{ name: '機械恐怖症', content: '機械や装置が怖い' },
			{ name: '巨大物恐怖症', content: '巨大なものが怖い' },
			{ name: '拘束恐怖症', content: '縛られたり結びつけられたりするのが怖い' },
			{ name: '隕石恐怖症', content: '流星や隕石が怖い' },
			{ name: '孤独恐怖症', content: '独りでいることが怖い' },
			{ name: '汚染恐怖症', content: '汚れたり汚染されたりすることが怖い' },
			{ name: '粘液恐怖症', content: '粘液、粘体が怖い' },
			{ name: '死体恐怖症', content: '死体が怖い' },
			{ name: '8恐怖症', content: '8の数字が怖い' },
			{ name: '歯恐怖症', content: '歯が怖い' },
			{ name: '夢恐怖症', content: '夢が怖い' },
			{ name: '名称恐怖症', content: '特定の言葉（1つ以上）を聞くのが怖い' },
			{ name: '蛇恐怖症', content: '蛇が怖い' },
			{ name: '鳥恐怖症', content: '鳥が怖い' },
			{ name: '寄生生物恐怖症', content: '寄生生物が怖い' },
			{ name: '人形恐怖症', content: '人形が怖い' },
			{ name: '恐食症', content: '飲み込むこと、食べること、もしくは食べられることが怖い' },
			{ name: '薬物恐怖症', content: '薬物が怖い' },
			{ name: '幽霊恐怖症', content: '幽霊が怖い' },
			{ name: '羞明(しゅうめい)', content: '日光が怖い' },
			{ name: 'ひげ恐怖症', content: 'ひげが怖い' },
			{ name: '河川恐怖症', content: '川が怖い' },
			{ name: 'アルコール恐怖症', content: 'アルコールやアルコール飲料が怖い' },
			{ name: '火恐怖症', content: '火が怖い' },
			{ name: '杖恐怖症', content: '魔術が怖い' },
			{ name: '暗闇恐怖症', content: '暗闇や夜が怖い' },
			{ name: '月恐怖症', content: '月が怖い' },
			{ name: '鉄道恐怖症', content: '列車の旅が怖い' },
			{ name: '星恐怖症', content: '星が怖い' },
			{ name: '狭所恐怖症', content: '狭いものや場所が怖い' },
			{ name: '対称恐怖症', content: '左右対称が怖い' },
			{ name: '生き埋め恐怖症', content: '生き埋めになることや墓地が怖い' },
			{ name: '雄牛恐怖症', content: '雄牛が怖い' },
			{ name: '電話恐怖症', content: '電話が怖い' },
			{ name: '奇形恐怖症', content: '怪物が怖い' },
			{ name: '海洋恐怖症', content: '海が怖い' },
			{ name: '手術恐怖症', content: '外科手術が怖い' },
			{ name: '13恐怖症', content: '13の数字が怖い' },
			{ name: '衣服恐怖症', content: '衣服が怖い' },
			{ name: '魔女恐怖症', content: '魔女と魔術が怖い' },
			{ name: '黄色恐怖症', content: '黄色や「黄色」という言葉が怖い' },
			{ name: '外国語恐怖症', content: '外国語が怖い' },
			{ name: '外国人恐怖症', content: '外国人が怖い' },
			{ name: '動物恐怖症', content: '動物が怖い' },
		],
		MA: [
			{ name: '洗浄マニア', content: '自分の体を洗わずにはいられない' },
			{ name: '無為マニア', content: '病的な優柔不断' },
			{ name: '暗黒マニア', content: '暗闇に対する過度の嗜好' },
			{ name: '高所マニア', content: '高い場所に上らずにはいられない' },
			{ name: '善良マニア', content: '病的な親切' },
			{ name: '広場マニア', content: '開けた場所にいたいという激しい願望' },
			{ name: '先鋭マニア', content: '鋭いもの、尖ったものへの執着' },
			{ name: '猫マニア', content: '猫に対する異常な愛好心' },
			{ name: '疼痛（とうつう）性愛', content: '痛みへの執着' },
			{ name: 'にんにくマニア', content: 'にんにくへの執着' },
			{ name: '乗り物マニア', content: '車の中にいることへの執着' },
			{ name: '病的快活', content: '不合理な朗らかさ' },
			{ name: '花マニア', content: '花への執着' },
			{ name: '計算マニア', content: '数への偏執的な没頭' },
			{ name: '浪費マニア', content: '衝動的あるいは無謀な浪費' },
			{ name: '自己マニア', content: '孤独への過度な嗜好' },
			{ name: 'バレエマニア', content: 'バレエに関する異常な愛好心' },
			{ name: '書籍窃盗癖', content: '本を盗みたいという脅迫的衝動' },
			{ name: '書物マニア', content: '本あるいは読書、あるいはその両方への執着' },
			{ name: '歯ぎしりマニア', content: '歯ぎしりしたいという脅迫的衝動' },
			{ name: '悪霊マニア', content: '誰かの中に邪悪な精霊がいるという病的な信念' },
			{ name: '自己愛マニア', content: '自分自身の美への執着' },
			{ name: '地図マニア', content: '至る所の地図を見る制御不可能な脅迫的衝動' },
			{ name: '飛び降りマニア', content: '高い場所から跳躍することへの執着' },
			{ name: '寒冷マニア', content: '冷たさ、または冷たいもの、あるいはその両方への異常な欲望' },
			{ name: '舞踏マニア', content: '踊ることへの愛好もしくは制御不可能な熱狂' },
			{ name: '睡眠マニア', content: '眠ることへの過度の願望' },
			{ name: '墓地マニア', content: '墓地への執着' },
			{ name: '色彩マニア', content: '特定の色への執着' },
			{ name: 'ピエロマニア', content: 'ピエロへの執着' },
			{ name: '遭遇マニア', content: '恐ろしい状況を経験したいという脅迫的衝動' },
			{ name: '殺害マニア', content: '殺害への執着' },
			{ name: '悪魔マニア', content: '誰かが悪魔にとりつかれているという病的な信念' },
			{ name: '皮膚マニア', content: '人の皮膚を引っ張りたいという強迫的衝動' },
			{ name: '正義マニア', content: '正義が完遂されるのを見たいという執着' },
			{ name: 'アルコールマニア', content: 'アルコールに関する異常な欲求' },
			{ name: '毛皮マニア', content: '毛皮を所有することへの執着' },
			{ name: '贈り物マニア', content: '贈り物を与えることへの執着' },
			{ name: '逃走マニア', content: '逃走することへの脅迫的衝動' },
			{ name: '外出マニア', content: '外を歩き回ることへの脅迫的衝動' },
			{ name: '自己中心マニア', content: '不合理な自己中心の態度か自己崇拝' },
			{ name: '公職マニア', content: '公的な職業に就きたいという強欲な職業' },
			{ name: '戦慄マニア', content: '誰かが罪を犯したという病的な信念' },
			{ name: '知識マニア', content: '知識を得ることへの執着' },
			{ name: '静寂マニア', content: '静寂であることへの脅迫的衝動' },
			{ name: 'エーテルマニア', content: 'エーテルへの切望' },
			{ name: '求婚マニア', content: '奇妙な求婚をすることへの執着' },
			{ name: '笑いマニア', content: '制御不可能な笑うことへの脅迫的衝動' },
			{ name: '魔術マニア', content: '魔女と魔術への執着' },
			{ name: '筆記マニア', content: '全てを書き留めることへの執着' },
			{ name: '裸体マニア', content: '裸になりたいという脅迫的衝動' },
			{ name: '幻想マニア', content: '快い幻想（現実とは関係なく）に囚われやすい異常な傾向' },
			{ name: '蟲マニア', content: '蟲に関する過度の嗜好' },
			{ name: '火器マニア', content: '火器への執着' },
			{ name: '水マニア', content: '水に関する不合理な渇望' },
			{ name: '魚マニア', content: '魚への執着' },
			{ name: 'アイコンマニア', content: '像や肖像への執着' },
			{ name: 'アイドルマニア', content: '偶像への執着または献身' },
			{ name: '情報マニア', content: '事実を集めることへの過度の献身' },
			{ name: '絶叫マニア', content: '叫ぶことへの説明できない脅迫的衝動' },
			{ name: '窃盗マニア', content: '盗むことへの説明できない脅迫的衝動' },
			{ name: '騒音マニア', content: '大きな、あるいは甲高い騒音を出すことへの制御不可能な脅迫的衝動' },
			{ name: 'ひもマニア', content: 'ひもへの執着' },
			{ name: '宝くじマニア', content: '宝くじに参加したいという極度の願望' },
			{ name: 'うつマニア', content: '異常に深くふさぎ込む傾向' },
			{ name: '巨石マニア', content: '環状列石／立石があると奇妙な考えに囚われる異常な傾向' },
			{ name: '音楽マニア', content: '音楽または特定の旋律への執着' },
			{ name: '作詩マニア', content: '詩を書くことへの強欲な願望' },
			{ name: '憎悪マニア', content: '何らかの対象あるいはグループの何もかもを憎む執着' },
			{ name: '偏執マニア', content: 'ただ1つの思想やアイデアへの異常な執着' },
			{ name: '虚言マニア', content: '異常なほどに嘘をついたり、誇張して話す' },
			{ name: '疫病マニア', content: '想像上の病気に苦しめられる幻想' },
			{ name: '記録マニア', content: 'あらゆるものを' },
			{ name: '名前マニア', content: '人々、場所、ものなどの名前への執着' },
			{ name: '単語マニア', content: 'ある単語を繰り返したいという抑えきれない欲求' },
			{ name: '爪損傷マニア', content: '夢の爪をむしったりはがそうとする脅迫的衝動' },
			{ name: '美食マニア', content: '1種類の食物への異常な愛' },
			{ name: '不平マニア', content: '不平を言うことへの異常な喜び' },
			{ name: '仮面マニア', content: '仮面や覆面を着けたいという脅迫的衝動' },
			{ name: '幽霊マニア', content: '幽霊への執着' },
			{ name: '殺人マニア', content: '殺人への病的な傾向' },
			{ name: '光線マニア', content: '光への病的な願望' },
			{ name: '放浪マニア', content: '社会の規範に背きたいという異常な欲望' },
			{ name: '長者マニア', content: '富への脅迫的な欲望' },
			{ name: '病的虚言マニア', content: '嘘をつきたくてたまらない脅迫的衝動' },
			{ name: '放火マニア', content: '火をつけることへの脅迫的衝動' },
			{ name: '質問マニア', content: '質問をしたいという激しい脅迫的衝動' },
			{ name: '鼻マニア', content: '鼻をいじりたいという脅迫的衝動' },
			{ name: '落書きマニア', content: 'いたずら書きや落書きへの執着' },
			{ name: '列車マニア', content: '列車と鉄道旅行への強い魅了' },
			{ name: '知性マニア', content: '誰かが信じられないほど知的であるという幻想' },
			{ name: 'テクノマニア', content: '新技術への執着' },
			{ name: 'タナトスマニア', content: '誰かが死を招く魔術によって呪われているという信念' },
			{ name: '宗教マニア', content: 'その人が神であるという信仰' },
			{ name: 'かき傷マニア', content: 'かき傷をつけることへの脅迫的衝動' },
			{ name: '手術マニア', content: '外科手術を行うことへの不合理な嗜好' },
			{ name: '抜毛マニア', content: '自分の髪を引き抜くことへの切望' },
			{ name: '失明マニア', content: '病的な視覚障害' },
			{ name: '異国マニア', content: '外国のものへの執着' },
			{ name: '動物マニア', content: '動物への正気でない溺愛' }
		],
		FCL: [
			'視界がぼんやりするか、あるいは一時的な失明。',
			'悲鳴、声、あるいはほかの雑音が肉体から発せられる。',
			'強風やほかの大気の現象。',
			'術者、ほかのその場に居合わせた者が出血する。あるいは環境（例えば、壁）から出血する。',
			'奇妙な幻視と幻覚。',
			'その付近の小動物たちが爆発する。',
			'硫黄の悪臭',
			'クトゥルフ神話の怪物が偶然召喚される。'
		],
		FCM: [
			'大地が震え、壁に亀裂が入って崩れる。',
			'叙事詩的な電撃。',
			'血が空から降る。',
			'術者の手がしなび、焼けただれる。',
			'術者は不自然に年をとる（年齢に+2D10歳、30ページの「年齢」を参照し、能力値に修正を適用すること）。',
			'強力な、あるいは無数のクトゥルフ神話存在が現れ、術者を手始めに、近くの全員を攻撃する！',
			'術者や近くの全員が遠い時代か場所に吸い込まれる。',
			'クトゥルフ神話の神格が偶然招来される。'
		]
	}

	Object.keys(patterns).forEach(pattern => {
		const match = message.content.match(patterns[pattern])
		if (match !== null) {
			const roll = (min = 1, max = 100) => Math.floor(Math.random() * (max + 1 - min) + min)
			const getTotalLists = bonusDice => {
				const units_digits = roll(0, 9)
				let totalList = []
				for (let i = 0; i < Math.abs(bonusDice) + 1; i++) {
					totalList.push(roll(0, 9) * 10 + units_digits)
				}
				return totalList
			}
			const getTotal = (totalList, bonusDice) => {
				if (bonusDice <= 0) {
					return totalList.reduce((a, b) => Math.max(a, b))
				} else {
					return totalList.reduce((a, b) => Math.min(a, b))
				}
			}
			const getResultText = (total, diff, fumbleable = false) => {
				if (total <= diff) {
					if (total === 1) return 'クリティカル'
					if (total <= diff / 5) return 'イクストリーム成功'
					if (total <= diff / 2) return 'ハード成功'
					return 'レギュラー成功'
				} else {
					if (total === 100) return 'ファンブル'
					if (total >= 96 && diff < 50) return 'ファンブル'
					if (total >= 96 && fumbleable) return 'ファンブル'
					return '失敗'
				}
			}
			const calc = form => {
				try {
					return eval(form)
				} catch (error) {
					return 0
				}
			}
			let output = ''

			switch (pattern) {
				// ヘルプ
				case 'help':
					output = new discord.MessageEmbed()
						.setTitle('dicebotヘルプ')
						.setDescription('各コマンドは入力内容の前方一致で検出')
						.setColor('BLUE')
						.addField('/help', 'ヘルプを表示')
						.addField('判定　CC(x)<=（目標値）', '　x：ボーナス・ペナルティダイス (2～－2)。省略可。\n　ファンブル／失敗／　レギュラー成功／ハード成功／\n　イクストリーム成功／クリティカル を自動判定。\n　例）`CC<=30`　`CC(2)<=50` `CC(+2)<=50` `CC(-1)<=75` `CC-1<=50` `CC1<=65` `CC+1<=65` `CC`')
						.addField('組み合わせ判定　(CBR(x,y))', '　目標値 x と y で％ロールを行い、成否を判定。\n例）CBR(50,20)')
						.addField('自動火器の射撃判定　FAR(w,x,y,z,d,v)', '　w：弾丸の数(1～100）、x：技能値（1～100）、y：故障ナンバー、\n　z：ボーナス・ペナルティダイス(-2～2)。省略可。\n　d：指定難易度で連射を終える（レギュラー：r,ハード：h,イクストリーム：e）。省略可。\n　v：ボレーの弾丸の数を変更する。省略可。\n　命中数と貫通数、残弾数のみ算出。ダメージ算出はありません。\n例）`FAR(25,70,98)`　`FAR(50,80,98,-1)`　`far(30,70,99,1,R)`\n　　`far(25,88,96,2,h,5)`　`FaR(40,77,100,,e,4)`　`fAr(20,47,100,,,3)`')
						.addField('各種表', '【狂気関連】\n　`BMR`：狂気の発作（リアルタイム）\n　`BMS`：狂気の発作（サマリー）\n　`PH`：恐怖症\n　`MA`：マニア\n【魔術関連】\nプッシュ時のキャスティング・ロールの失敗表\n・`FCL`：強力でない呪文\n・`FCM`：強力な呪文')
					break;
				// 通常技能ロール
				case 'CC':
					{
						// ボーナスダイス
						const bonusDice = Number((match[1] || '0').replace('(', '').replace(')', ''))
						// 目標値
						const diff = calc(match[2])

						// 目標値<=0
						if (diff <= 0) break;
						// ボーナスダイスが-2~2の範囲にない
						if (bonusDice < -2 || bonusDice > 2) break;

						output += `(1D100<=${diff}) ボーナス・ペナルティダイス[${bonusDice}]`

						const totalList = getTotalLists(bonusDice)
						const total = getTotal(totalList, bonusDice)
						const resultText = getResultText(total, diff)

						output += ` ＞ ${totalList.join(", ")} ＞ ${total} ＞ ${resultText}`
					}
					break;
				// 組み合わせロール
				case 'CBR':
					// 組み合わせロール
					{
						// 目標値
						match.shift()
						const diff = match.map(val => calc(val.replace(',', '')))
						// ダイスの値
						const total = roll(1, 100)
						// それぞれの結果
						const resultText = diff.map(val => getResultText(total, val))
						// 成功回数
						const successList = ['クリティカル', 'イクストリーム成功', 'ハード成功', 'レギュラー成功']
						const successCount = resultText.filter(val => successList.includes(val)).length
						// 最終的な成功度
						const rank = (() => {
							if (diff.length === successCount) {
								return '成功'
							} else if (successCount > 0) {
								return '部分的成功'
							} else {
								return '失敗'
							}
						})()

						output = `(1d100<=${diff.join(',')}) ＞ ${total}[${resultText.join(',')}] ＞ ${rank}`
					}
					break;
				// 自動火器ロール
				case 'FAR':
					// 自動火器
					{
						// 弾丸の数
						const bullet = calc(match[1])
						// 技能値
						const diff = calc(match[3])
						// 故障ナンバー
						const brokenNumber = calc(match[5])
						// ボーナスダイス・ペナルティダイス
						const bonusDice = calc(match[7] || 0)
						// 指定難易度で終了
						const endDiff = match[9] || ''
						// ボレー弾丸の数
						const volley = calc(match[11] || Math.floor(diff / 10))

						// 弾丸<=0
						if (bullet <= 0) break;
						// 技能値<=0
						if (diff <= 0) break;
						// ボーナスダイスが-2~2の範囲にない
						if (bonusDice < -2 || bonusDice > 2) break;

						// 弾丸の数調整
						const bulletLimit = 100
						if (bullet > bulletLimit) {
							output += `\n弾薬が多すぎます。装填された弾薬を${bulletLimit}発に変更します。\n`
							bullet = bulletLimit
						}

						output += `ボーナス・ペナルティダイス[${bonusDice}]`

						output = (() => {
							const getNextDiffMessage = i => {
								switch (i) {
									case 0: return ''
									case 1: return '\n【難易度がハード成功に変更】'
									case 2: return '\n【難易度がイクストリーム成功に変更】'
									case 3: return '\n【難易度がクリティカルに変更】'
								}
							}
							const getHitResultInfos = (dice, diff, i) => {
								const units_digit = roll(0, 9)
								const totalList = getTotalLists(dice, units_digit)
								total = getTotal(totalList, dice)

								hitResult = getResultText(total, diff, (i >= 1))

								return { hitResult, total, totalList }
							}
							const getHitResultText = (output, counts) => `${output}\n${counts.hit}発が命中、${counts.impale}発が貫通、残弾${counts.bullet}発`
							const getHitType = (i, hitResult) => {
								const { successList, impaleBulletList } = (() => {
									let successList = []
									let impaleBulletList = []

									switch (i) {
										case 0:
											successList = ["ハード成功", "レギュラー成功"]
											impaleBulletList = ["クリティカル", "イクストリーム成功"]
											break;
										case 1:
											successList = ["ハード成功"]
											impaleBulletList = ["クリティカル", "イクストリーム成功"]
											break;
										case 2:
											successList = []
											impaleBulletList = ["クリティカル", "イクストリーム成功"]
											break;
										case 3:
											successList = ["クリティカル"]
											impaleBulletList = []
											break;
									}

									return { successList, impaleBulletList }
								})()
								if (successList.includes(hitResult)) return 'hit'
								if (impaleBulletList.includes(hitResult)) return 'impale'
								return ''
							}
							const getBulletResults = (bullet, hitType, diff) => {
								const bulletSetCount = (() => {
									if (diff <= 0) return 0
									return Math.max(Math.floor(diff / 10), 1)
								})()
								const hitBulletCountBase = (() => {
									if (diff <= 0) return 0
									return Math.max(Math.floor(bulletSetCount / 2), 1)
								})()

								let lostBulletCount = 0
								let hitBulletCount = 0
								let impaleBulletCount = 0

								if ((bullet - bulletSetCount) >= 0) {
									switch (hitType) {
										case 'hit':
											// 通常命中した弾数の計算
											hitBulletCount = hitBulletCountBase
											break;
										case 'impale':
											// 貫通した弾数の計算
											hitBulletCount = Math.floor(bulletSetCount / 2.0)
											impaleBulletCount = Math.ceil(bulletSetCount / 2.0)
											break;
									}

									lostBulletCount = bulletSetCount
								} else {
									switch (hitType) {
										case 'hit':
											hitBulletCount = Math.max(Math.floor(bullet / 2.0), 1)
											break;
										case 'impale':
											hitBulletCount = Math.floor(bullet / 2.0)
											impaleBulletCount = Math.ceil(bullet / 2.0)
											break;
									}
									lostBulletCount = bullet
								}

								return {
									hitBullet: hitBulletCount,
									impaleBullet: impaleBulletCount,
									lostBullet: lostBulletCount
								}
							}
							let loopCount = 0
							let dice = bonusDice
							let counts = {
								hit: 0,
								impale: 0,
								bullet: bullet
							}

							for (let i = 0; i <= 3; i++) {
								output += getNextDiffMessage(i)

								while (dice >= -2) {
									loopCount++
									const { hitResult, total, totalList } = getHitResultInfos(dice, diff, i)

									if (total >= brokenNumber) {
										output += 'ジャム'
										return getHitResultText(output, counts)
									}

									hitType = getHitType(i, hitResult)
									const { hitBullet, impaleBullet, lostBullet } = getBulletResults(counts.bullet, hitType, diff)

									output += `\n${loopCount}回目: ＞ ${totalList.join(", ")} ＞ ${hitResult}（${hitBullet}発命中、${impaleBullet}発貫通）`

									counts.hit += hitBullet
									counts.impale += impaleBullet
									counts.bullet -= lostBullet

									if (counts.bullet <= 0) return getHitResultText(output, counts)

									dice--
								}

								dice++
							}

							return getHitResultText(output, counts)
						})()
					}
					break;
				// 狂気の発作(リアルタイム)
				case 'BMR':
					{
						if ((match[1] || '').replace(' ', '') === 'all') {
							output = new discord.MessageEmbed()
								.setTitle('狂気の発作（リアルタイム）一覧表')
								.setColor('GREEN')
							utilList.BMR.forEach((val, i) => output.addField(`${i + 1}）${val.name}`, val.content))
						} else {
							const dice = roll(1, 10)
							output += `狂気の発作（リアルタイム）(${dice}) ＞ **${utilList.BMR[dice - 1].name}**：${utilList.BMR[dice - 1].content} (1D10＞${roll(1, 10)}ラウンド)`
						}
					}
					break;
				// 狂気の発作(サマリー)
				case 'BMS':
					{
						if ((match[1] || '').replace(' ', '') === 'all') {
							output = new discord.MessageEmbed()
								.setTitle('狂気の発作（サマリー）一覧表')
								.setColor('GREEN')
							utilList.BMS.forEach((val, i) => output.addField(`${i + 1}）${val.name}`, val.content))
						} else {
							const dice = roll(1, 10)
							output += `狂気の発作（サマリー）(${dice}) ＞ **${utilList.BMS[dice - 1].name}**：${utilList.BMS[dice - 1].content} (1D10＞${roll(1, 10)}時間)`
						}
					}
					break;
				// 恐怖症
				case 'PH':
					{
						if ((match[1] || '').replace(' ', '') === 'all') {
							output = ''
							let embeds = []
							utilList.PH.forEach((val, i) => {
								if (i % 25 === 0) {
									embeds[i / 25] = new discord.MessageEmbed()
										.setTitle(`恐怖症一覧（${i + 1}～${i + 25}）`)
										.setColor('GREEN')
								}
								embeds[Math.floor(i / 25)].addField(`${i + 1}）${utilList.PH[i].name}`, utilList.PH[i].content)
							})
							embeds.forEach(embed => message.channel.send(embed))
						} else {
							const dice = roll(1, 100)
							output += `恐怖症(${dice}) ＞ **${utilList.PH[dice - 1].name}**：${utilList.PH[dice - 1].content}`
						}
					}
					break;
				// マニア
				case 'MA':
					{
						if ((match[1] || '').replace(' ', '') === 'all') {
							output = ''
							let embeds = []
							utilList.MA.forEach((val, i) => {
								if (i % 25 === 0) {
									embeds[i / 25] = new discord.MessageEmbed()
										.setTitle(`マニア一覧（${i + 1}～${i + 25}）`)
										.setColor('GREEN')
								}
								embeds[Math.floor(i / 25)].addField(`${i + 1}）${utilList.MA[i].name}`, utilList.MA[i].content)
							})
							embeds.forEach(embed => message.channel.send(embed))
						} else {
							const dice = roll(1, 100)
							output += `マニア(${dice}) ＞ **${utilList.MA[dice - 1].name}**：${utilList.MA[dice - 1].content}`
						}
					}
					break;
				// プッシュ時のキャスティング・ロールの失敗表(強力でない呪文)
				case 'FCL':
					{
						if ((match[1] || '').replace(' ', '') === 'all') {
							output = new discord.MessageEmbed()
								.setTitle('キャスティング・ロール失敗(小)一覧表')
								.setColor('GREEN')
							let content = ''
							utilList.FCL.forEach((val, i) => content += `**${i + 1}）**${val}\n`)
							output.setDescription(content)
						} else {
							const dice = roll(1, 8)
							output += `キャスティング・ロール失敗(小)(${dice}) ＞ ${utilList.FCL[dice - 1]}`
						}
					}
					break;
				// プッシュ時のキャスティング・ロールの失敗表(強力な呪文)
				case 'FCM':
					{
						if ((match[1] || '').replace(' ', '') === 'all') {
							output = new discord.MessageEmbed()
								.setTitle('キャスティング・ロール失敗(大)一覧表')
								.setColor('GREEN')
							let content = ''
							utilList.FCM.forEach((val, i) => content += `**${i + 1}）**${val}\n`)
							output.setDescription(content)
						} else {
							const dice = roll(1, 8)
							output += `キャスティング・ロール失敗(大)(${dice}) ＞ ${utilList.FCM[dice - 1]}`
						}
					}
					break;
				case 'dice':
					{
						const evalDiceRoll = str => {
							// ()内 > dice > 四則演算の優先度で計算

							let evalStr = str
							// 括弧探索
							evalStr = (() => {
								const bracketPos = evalStr.indexOf('(')
								if (bracketPos >= 0) {
									let bracketNest = 1
									let currentPos = bracketPos
									while (true) {
										if (bracketNest === 0) break;
										const nextOpen = (() => (evalStr.indexOf('(', currentPos + 1) === -1) ? 10000 : evalStr.indexOf('(', currentPos + 1))()
										const nextClose = (() => (evalStr.indexOf(')', currentPos + 1) === -1) ? 10000 : evalStr.indexOf(')', currentPos + 1))()
										if (nextClose < nextOpen) {
											// )がくる
											bracketNest--
											currentPos = nextClose
										} else {
											// (がくる
											bracketNest++
											currentPos = nextOpen
										}
									}
									const inBracket = evalStr.substring(bracketPos + 1, currentPos)
									return evalStr.replaceAt(bracketPos, currentPos, evalDiceRoll(inBracket))
								} else {
									return evalStr
								}
							})()

							// dice探索
							while (true) {
								const dicePos = evalStr.search(/\d+d\d+/i)
								if (dicePos >= 0) {
									const matches = evalStr.match(/(\d+)d(\d+)/i)
									evalStr = evalStr.replaceAt(dicePos, dicePos + matches[0].length - 1, (() => {
										const totalList = (() => {
											let totalList = []
											for (let i = 0; i < Number(matches[1]); i++) {
												if (Number(matches[2]) === 0) {
													totalList.push(0)
												} else {
													totalList.push(roll(1, Number(matches[2])))
												}
											}
											return totalList
										})()
										const total = totalList.reduce((a, b) => a + b, 0)

										return `${total}`
									})())
								} else {
									break;
								}
							}

							// 式評価
							return calc(evalStr)
						}

						if (match[0] === 'd66') break;

						switch (match[2]) {
							case '<=':
								{
									// ～以下なら
									const evalStr = match[1]
									const result = evalDiceRoll(evalStr)
									const diff = calc(match[3])

									if (diff === 0) break;

									const resultText = (() => (result <= diff) ? '成功' : '失敗')
									output = `(${match[0]}) ＞ ${result} ＞ ${resultText}`
								}
								break;
							case '>=':
								{
									// ～以上なら
									const evalStr = match[1]
									const result = evalDiceRoll(evalStr)
									const diff = calc(match[3])

									if (diff === 0) break;

									const resultText = (() => (result >= diff) ? '成功' : '失敗')
									output = `(${match[0]}) ＞ ${result} ＞ ${resultText}`
								}
								break;
							default:
								{
									// ダイスロールのみ
									const evalStr = match[1]
									const result = evalDiceRoll(evalStr)

									output = `(${match[0]}) ＞ ${result}`
								}
								break;
						}
					}
					break;
				case 'simple':
					{
						output = `(d66) ＞ ${roll(1, 6) * 10 + roll(1, 6)}`
					}
					break;
			}

			if (output !== '') message.channel.send(output)
		}
	})
})

client.login(process.env.TOKEN);