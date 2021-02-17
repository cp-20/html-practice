// {
	const size = { x: 8, y: 8 }

	const arroundCells = [
		{x: -1, y: -1},
		{x: 0, y: -1},
		{x: 1, y: -1},
		{x: -1, y: 0},
		{x: 1, y: 0},
		{x: -1, y: 1},
		{x: 0, y: 1},
		{x: 1, y: 1}
	]

	const sleep = msec => new Promise(resolve => setTimeout(() => resolve(), msec))

	class Board {
		constructor() {
			// 盤面
			this.board = new Array(size.x * size.y);
			for (let i = 0; i < size.x * size.y; i++) {
				this.board[i] = {
					// 置かれているかどうか
					put: false,
					// 何色が置かれているか
					color: '',
					// 白が置けるかどうか
					putWhite: false,
					// 黒が置けるかどうか
					putBlack: false
				}
			}
			// 手番
			this.turn = 'black';
			// それぞれのマス
			this.blackCount = 0;
			this.whiteCount = 0;
			// それぞれの置けるマス
			this.putBlackCount = 0;
			this.putWhiteCount = 0;

			// 最初の4マス配置
			this.put(3, 3, 'white', true);
			this.put(4, 3, 'black', true);
			this.put(3, 4, 'black', true);
			this.put(4, 4, 'white', true);
			
			// 初期化
			const board = document.getElementById('rv-board');
			board.innerHTML = '';
			for (let y = 0; y < size.y; y++) {
				const line = document.createElement('tr');
				for (let x = 0; x < size.x; x++) {
					const cell = document.createElement('td');
					cell.classList.add('cell');
					cell.dataset.x = x;
					cell.dataset.y = y;

					cell.addEventListener('click', {this: this, handleEvent: function(e) {
						const clickX = Number(e.currentTarget.dataset.x);
						const clickY = Number(e.currentTarget.dataset.y);
						
						// 自分の手番か確認
						if (this.this.turn == 'white') return;

						// 設置
						this.this.put(clickX, clickY, 'black');
					}});

					line.appendChild(cell);
				}
				board.appendChild(line);
			}

			// 描画
			this.draw();
		}

		// x, y → i
		getIndex(x, y) {
			return x + y  * size.y;
		}

		// i → x, y
		getPos(index) {
			return {
				x: index % size.y,
				y: index / size.y
			};
		}

		// 盤面内かどうか
		inBoard(x, y) {
			return (x >= 0 && x < size.x && y >= 0 && y < size.y);
		}

		// 設置
		put(putX, putY, color, force=false) {
			const cell = this.board[this.getIndex(putX, putY)];

			// 設置不可能な場合
			if (cell.put) return;
			if (color == 'black' && !cell.putBlack && !force) return;
			if (color == 'white' && !cell.putWhite && !force) return;

			// 設置フラグ
			cell.put = true;
			cell.color = color;

			// それぞれのコマの数
			if (color == 'black') {
				this.blackCount++;
			}else {
				this.whiteCount++;
			}

			// ひっくり返す
			if (!force) {
				for (let i = 0; i < arroundCells.length; i++) {
					const direction = arroundCells[i];

					for (let d = 1; true; d++) {
						const nextX = putX + direction.x * d;
						const nextY = putY + direction.y * d;

						// 盤面外に出る
						if (!this.inBoard(nextX, nextY)) break;
						// 何も置かれてない
						if (!this.board[this.getIndex(nextX, nextY)].put) break;
						// 自分のコマ
						if (this.board[this.getIndex(nextX, nextY)].color == color) {
							for (let r = 1; r < d; r++) {
								const reverseX = putX + direction.x * r;
								const reverseY = putY + direction.y * r;

								// コマを反転(自分のコマに)
								this.board[this.getIndex(reverseX, reverseY)].color = color

								// コマの数
								if (color == 'black') {
									this.blackCount++;
									this.whiteCount--;
								}else {
									this.blackCount--;
									this.whiteCount++;
								}

								// アニメーション
								const reverseCell = document.querySelector(`#rv-board td[data-x="${reverseX}"][data-y="${reverseY}"]`);
								reverseCell.classList.add('reverse');
							}
							break;
						}
					}
				}
			}

			// 設置可能フラグ
			this.putBlackCount = 0;
			this.putWhiteCount = 0;
			for (let y = 0; y < size.y; y++) {
				for (let x = 0; x < size.x; x++) {
					const cell = this.board[this.getIndex(x, y)];
					cell.putBlack = false;
					cell.putWhite = false;
					if (!cell.put) {
						for (let i = 0; i < arroundCells.length; i++) {
							const direction = arroundCells[i];

							let myColor = '';
							for (let d = 1; true; d++) {
								const nextX = x + direction.x * d;
								const nextY = y + direction.y * d;
			
								// 盤面外に出る
								if (!this.inBoard(nextX, nextY)) break;
								const nextCell = this.board[this.getIndex(nextX, nextY)];
								// 何も置かれてない
								if (!nextCell.put) break;
								// 置けるかどうか
								if (d == 1) {
									myColor = nextCell.color;
								}else {
									if (nextCell.color != myColor) {
										if (myColor == 'white') {
											cell.putBlack = true;
											this.putBlackCount++;
										}else {
											cell.putWhite = true;
											this.putWhiteCount++;
										}
									}
								}
							}
						}
					}
				}				
			}

			if (force) return;

			// 終了処理
			if (this.blackCount + this.whiteCount == size.x * size.y) {
				this.end();
				return;
			}

			// 手番交代
			if (color == 'black') {
				if (this.putWhiteCount > 0) {
					this.turn = 'white';
				}else {
					this.turn = 'black';
					this.pass('white');
				}
			}else {
				if (this.putBlackCount > 0) {
					this.turn = 'black';
				}else {
					this.turn = 'white';
					this.pass('black');
				}
			}

			// 描画
			this.draw();

			// 相手のターン
			if (this.turn == 'white') {
				this.action();
			}
		}

		// CPUのターン
		async action() {
			// 1s待機
			await sleep(1000);

			// 選択肢リスト
			let choices = [];
			for (let y = 0; y < size.y; y++) {
				for (let x = 0; x < size.x; x++) {
					if (this.board[this.getIndex(x, y)].putWhite) {
						choices.push({ x: x, y: y });
					}
				}
			}

			// それぞれ評価
			const scores = choices.map(choice => {
				// ひっくり返す枚数
				const reverseCount = (() => {
					for (let i = 0; i < arroundCells; i++) {
						for (let i = 0; i < arroundCells.length; i++) {
							const direction = arroundCells[i];
			
							for (let d = 1; true; d++) {
								const nextX = choice.x + direction.x * d;
								const nextY = choice.y + direction.y * d;
			
								// 盤面外に出る
								if (!this.inBoard(nextX, nextY)) break;
								// 何も置かれてない
								if (!this.board[this.getIndex(nextX, nextY)].put) break;
								// 自分のコマ
								if (this.board[this.getIndex(nextX, nextY)].color == 'white') return d - 1;
							}
						}		
					}
					return 0;
				})();

				// 自分と相手の置けるマス
				this.board[this.getIndex(choice.x, choice.y)].put = true;
				this.board[this.getIndex(choice.x, choice.y)].color = 'white';
				const { putBlackCount, putWhiteCount } = (() => {
					let putBlackCount = 0;
					let putWhiteCount = 0;
					for (let y = 0; y < size.y; y++) {
						for (let x = 0; x < size.x; x++) {
							const cell = this.board[this.getIndex(x, y)];
							if (!cell.put) {
								for (let i = 0; i < arroundCells.length; i++) {
									const direction = arroundCells[i];

									let myColor = '';
									for (let d = 1; true; d++) {
										const nextX = x + direction.x * d;
										const nextY = y + direction.y * d;
					
										// 盤面外に出る
										if (!this.inBoard(nextX, nextY)) break;
										const nextCell = this.board[this.getIndex(nextX, nextY)];
										// 何も置かれてない
										if (!nextCell.put) break;
										// 置けるかどうか
										if (d == 1) {
											myColor = nextCell.color;
										}else {
											if (nextCell.color != myColor) {
												if (myColor == 'white') {
													putBlackCount++;
												}else {
													putWhiteCount++;
												}
											}
										}
									}
								}
							}
						}
					}
					return { putBlackCount, putWhiteCount }
				})();
				this.board[this.getIndex(choice.x, choice.y)].put = false;
				this.board[this.getIndex(choice.x, choice.y)].color = '';
				
				switch (difficulty) {
					case 'easy':
						return reverseCount * 100 - putBlackCount * 10 + putWhiteCount * 10;						
					case 'normal':
						return reverseCount * 10 - putBlackCount * 20 + putWhiteCount * 10;						
					case 'hard':
						return reverseCount * 10 - putBlackCount * 30 + putWhiteCount * 10;						
				}
			});

			const decision = choices[scores.indexOf(scores.reduce((a,b) => Math.max(a,b)))];
			this.put(decision.x, decision.y, 'white');
		}

		// 描画
		draw() {
			for (let y = 0; y < size.y; y++) {
				for (let x = 0; x < size.x; x++) {
					const cell = document.querySelector(`#rv-board td[data-x="${x}"][data-y="${y}"]`);
					const cellContent = this.board[this.getIndex(x, y)];

					// 色
					cell.classList.remove('black');
					cell.classList.remove('white');
					if (cellContent.color) cell.classList.add(cellContent.color);

					// 設置可能か
					if (cellContent.putBlack) {
						cell.classList.add('putBlack');
					}else {
						cell.classList.remove('putBlack');
					}
					if (cellContent.putWhite) {
						cell.classList.add('putWhite');
					}else {
						cell.classList.remove('putWhite');
					}

					// 手番
					const board = document.getElementById('rv-board');					
					board.classList.remove('black');
					board.classList.remove('white');
					if (this.turn) board.classList.add(this.turn);
					const settings = document.getElementById('rv-settings');
					settings.classList.remove('black');
					settings.classList.remove('white');
					if (this.turn) settings.classList.add(this.turn);

					// コマの数
					document.getElementById('black-counter').value = this.blackCount;
					document.getElementById('white-counter').value = this.whiteCount;
				}
			}
		}

		// 終了
		end() {
			const overlay = document.getElementById('rv-overlay');
			overlay.classList.remove('black-pass');
			overlay.classList.remove('white-pass');
			if (this.blackCount < this.whiteCount) {
				// 白の勝ち
				overlay.classList.add('white-win');
			}else if (this.blackCount > this.whiteCount) {
				// 黒の勝ち
				overlay.classList.add('black-win');
			}else {
				// 引き分け
				overlay.classList.add('draw');
			}
			this.draw();
		}

		// パスの演出
		pass(color) {
			const overlay = document.getElementById('rv-overlay');
			overlay.classList.remove('black-pass');
			overlay.classList.remove('white-pass');
			overlay.classList.add(`${color}-pass`);
		}
	}

	// 難易度設定
	let difficulty = 'easy';
	document.getElementById('com-difficulty-setting').addEventListener('change', function() {
		difficulty = this.value;
	});

	function restart() {
		const overlay = document.getElementById('rv-overlay');
		overlay.classList.remove('white-win');
		overlay.classList.remove('black-win');
		overlay.classList.remove('draw');
		board = new Board();
	}

	// START
	document.getElementById('rv-start').addEventListener('click', () => {
		restart();
	});

	// RESTART
	for (const button of document.getElementsByClassName('rv-restart')) {
		button.addEventListener('click', () => {
			restart();
		});
	}

	let board = new Board();
// }