const arroundCells = [
	{x: -1, y: -1},
	{x: -1, y: 0},
	{x: -1, y: 1},
	{x: 0, y: -1},
	{x: 0, y: 1},
	{x: 1, y: -1},
	{x: 1, y: 0},
	{x: 1, y: 1},
]

// 盤面
class Board {
	constructor(x, y, mine) {
		// X方向の大きさ
		this.sizeX = x;
		// Y方向の大きさ
		this.sizeY = y;
		// 地雷の数
		this.mine = mine;
		// 盤面の配列
		this.board = new Array(x * y);
		for (let i = 0; i < this.board.length; i++) {
			this.board[i] = {
				// 地雷かどうか
				mine: false,
				// 既に開いているか
				opened: false,
				// 周囲の地雷の数
				mineCount: 0,
				// 旗フラグ
				flag: false
			}
		}
		// 初期化フラグ
		this.initialized = false;
		// 爆発フラグ
		this.bombed = false

		// 盤面初期化
		this.initialize();
		// 盤面描画
		this.draw();
	}

	// x, y → i
	getIndex(x, y) {
		return x + this.sizeX * y;
	}

	// i → x, y
	getPos(i) {
		return {
			x: i % this.sizeX,
			y: Math.floor(i / this.sizeX)
		};
	}

	// 盤面上にあるか
	inBoard(x=0, y=0) {
		return x >= 0 && x < this.sizeX && y >= 0 && y < this.sizeY
	}

	// マスを開く
	open(openX, openY) {
		// 開ける
		const cell = document.querySelector(`#msBoard td[data-x="${openX}"][data-y="${openY}"]`);
		cell.classList.remove('closed');
		cell.classList.add('opened');

		// 初期化処理
		if (!this.initialized) {
			// ランダムで地雷を埋める
			let cellList = []
			for (let y = 0; y < this.sizeY; y++) {
				for (let x = 0; x < this.sizeX; x++) {
					if (openX-2 > x || x > openX+2 || openY-2 > y || y > openY+2) {
						cellList.push(this.getIndex(x, y));
					}
				}
			}
			for (let i = 0; i < this.mine; i++) {
				const index = Math.floor(Math.random() * cellList.length)
				this.board[cellList[index]].mine = true;
				const {x: mineX, y: mineY} = this.getPos(cellList[index]);
				for (let y = mineY-1; y <= mineY+1; y++) {
					if (!this.inBoard(0,y)) continue;
					for (let x = mineX-1; x <= mineX+1; x++) {
						if (!this.inBoard(x)) continue;
						this.board[this.getIndex(x, y)].mineCount++;
					}
				}
				cellList.splice(index, 1);
			}

			this.initialized = true;
		}

		// 地雷処理
		if (this.board[this.getIndex(openX, openY)].mine) {
			// 爆発(ゲームオーバー)
			this.bomb();
		}else {
			// 開く
			this.board[this.getIndex(openX, openY)].opened = true;
			if (this.board[this.getIndex(openX, openY)].mineCount == 0) {
				for (let i = 0; i < arroundCells.length; i++) {
					const x = openX + arroundCells[i].x;
					const y = openY + arroundCells[i].y;
					if (!this.inBoard(x, y)) continue;
					if (this.board[this.getIndex(x, y)].opened) continue;
					this.open(x, y);
				}
			}
		}
	}

	// 爆発(ゲームオーバー)
	bomb() {
		console.log('bomb');
		this.bombed = true;

		// 爆弾描画
		this.draw();

		// 

	}

	// 盤面初期化
	initialize() {
		// 盤面取得
		const board = document.getElementById('msBoard');

		board.innerHTML = '';

		for (let y = 0; y < this.sizeY; y++) {
			const line = document.createElement('tr');
			line.classList.add('line')
			for (let x = 0; x < this.sizeX; x++) {
				const cell = document.createElement('td');
				cell.classList.add('cell');
				cell.classList.add('closed')
				cell.dataset.x = x;
				cell.dataset.y = y;
				// クリック処理
				cell.addEventListener('click', {this: this, handleEvent: function(e){
					const clickX = Number(e.currentTarget.dataset.x);
					const clickY = Number(e.currentTarget.dataset.y);
					
					// 旗が立ってる
					if (this.this.board[this.this.getIndex(clickX, clickY)].flag) return;

					this.this.open(clickX, clickY);
					this.this.draw();
				}});

				// 右クリック処理
				cell.addEventListener('contextmenu', {this: this, handleEvent: function(e) {
					const clickX = Number(e.currentTarget.dataset.x);
					const clickY = Number(e.currentTarget.dataset.y);
					
					// 通常のコンテキストメニュー抑制
					e.preventDefault();
					
					// 旗フラグ反転
					this.this.board[this.this.getIndex(clickX, clickY)].flag = !this.this.board[this.this.getIndex(clickX, clickY)].flag;

					// 描画
					this.this.draw();
				}});

				// ダブルクリック処理
				cell.addEventListener('dblclick', {this: this, handleEvent: function(e) {
					const clickX = Number(e.currentTarget.dataset.x);
					const clickY = Number(e.currentTarget.dataset.y);

					// 周囲の爆弾をカウント
					let mineCount = 0;
					for (let i = 0; i < arroundCells.length; i++) {
						const x = clickX + arroundCells[i].x;
						const y = clickY + arroundCells[i].y;
						if (!this.this.inBoard(x, y)) continue;
						if (this.this.board[this.this.getIndex(x, y)].flag) mineCount++
					}
					console.log(mineCount);

					// 数字と合致したなら開く
					if (mineCount == this.this.board[this.this.getIndex(clickX, clickY)].mineCount) {
						for (let i = 0; i < arroundCells.length; i++) {
							const x = clickX + arroundCells[i].x;
							const y = clickY + arroundCells[i].y;
							if (!this.this.inBoard(x, y)) continue;
							if (this.this.board[this.this.getIndex(x, y)].flag) continue;
							if (this.this.board[this.this.getIndex(x, y)].opened) continue;
							this.this.open(x, y);
						}
						this.this.draw();
					}
				}})

				line.appendChild(cell);
			}
			board.appendChild(line);
		}
	}

	// 盤面描画
	draw() {
		// 盤面取得
		const board = document.getElementById('msBoard');

		for (let y = 0; y < this.sizeY; y++) {
			for (let x = 0; x < this.sizeX; x++) {
				const cell = document.querySelector(`#msBoard td[data-x="${x}"][data-y="${y}"]`);
				const cellContent = this.board[this.getIndex(x, y)];

				if (this.bombed) {
					if (cellContent.mine) {
						if (cellContent.flag) {
							cell.textContent = '🚩';
						}else {
							cell.textContent = '💣';
						}
					}else {
						if (cellContent.opened) {
							if (cellContent.mine) {
								cell.textContent = '💣';
							}else {
								if (cellContent.mineCount > 0) {
									cell.textContent = `${cellContent.mineCount}`;
									cell.dataset.mines = cellContent.mineCount;
								}
							}
						}else {
							if (cellContent.flag) {
								if (cellContent.mine) {
									cell.textContent = '🚩';
									cell.classList.add('success');
								}else {
									cell.textContent = '🚩';
									cell.classList.add('miss');
								}
							}
						}
					}
				}else {
					if (cellContent.opened) {
						if (cellContent.mine) {
							cell.textContent = '💣';
						}else {
							if (cellContent.mineCount > 0) {
								cell.textContent = `${cellContent.mineCount}`;
								cell.dataset.mines = cellContent.mineCount;
							}
						}
					}else {
						if (cellContent.flag) {
							cell.textContent = '🚩';
						}else {
							cell.textContent = '';
						}
					}
				}
			}
		}
	}
}

// 設定
class Settings {
	constructor(difficulty) {
		this.difficulty = difficulty;

		// サイズ取得
		this.getSize();

		// 更新
		this.refresh();

		// 難易度更新
		document.getElementById('ms-difficulty').addEventListener('change', {this: this, handleEvent: function(e) {
			this.this.difficulty = e.currentTarget.value;
			this.this.getSize();
			this.this.refresh();
		}});
	}

	getSize() {
		switch (this.difficulty) {
			case 'easy':
				this.sizeX = 9;
				this.sizeY = 9;
				this.mines = 10;
				break;
			case 'normal':
				this.sizeX = 16;
				this.sizeY = 16;
				this.mines = 40;
				break;
			case 'hard':
				this.sizeX = 30;
				this.sizeY = 16;
				this.mines = 90;
				break;
		}
	}

	refresh() {
		if (this.difficulty == 'custom') {
			document.getElementById('ms-sizeX').disabled = false;
			document.getElementById('ms-sizeY').disabled = false;
			document.getElementById('ms-mines').disabled = false;
		}else {
			document.getElementById('ms-sizeX').value = this.sizeX;
			document.getElementById('ms-sizeY').value = this.sizeY;
			document.getElementById('ms-mines').value = this.mines;
			document.getElementById('ms-sizeX').disabled = true;
			document.getElementById('ms-sizeY').disabled = true;
			document.getElementById('ms-mines').disabled = true;
		}
	}
}

const settings = new Settings('easy');

// 盤面取得
const board = new Board(settings.sizeX, settings.sizeY, settings.mines);
