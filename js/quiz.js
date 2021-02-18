{
	// HTML用エスケープ
	function escapeHTML(string) {
		if(typeof string !== 'string') {
			return string;
		}
		return string.replace(/[&'`"<>]/g, function(match) {
			return {
				'&': '&amp;',
				"'": '&#x27;',
				'`': '&#x60;',
				'"': '&quot;',
				'<': '&lt;',
				'>': '&gt;',
			}[match]
		});
	}
	let answerCount = 0;
	let correctCount = 0;

	const root = document.getElementById('quiz');
	let quizCount = root.getElementsByClassName('quiz').length;

	for (let i = 0; i < quizCount; i++) {
		const quiz = root.getElementsByClassName('quiz')[i];
		const choicesRoot = quiz.querySelector('div.choices');

		// 選択肢を選んだ際の処理
		choicesRoot.querySelectorAll('p.choice').forEach(choice => {
			choice.dataset.index = i;
			choice.onclick = function() {
				if (this.parentElement.classList.contains('answered')) return;
				this.parentElement.classList.add('answered');
				const result = root.querySelector(`#result .quizes p:nth-of-type(${Number(this.dataset.index)+1}) span.answer`)
				if (!this.classList.contains('answer')) {
					this.classList.add('missed');
					this.parentElement.classList.add('wrong');
					result.classList.add('wrong');
				}else {
					this.parentElement.classList.add('correct');
					result.classList.add('correct');
					answerCount++;
					document.getElementById('result-quiz-correct').textContent = answerCount;
				}
			}
		});

		const answer = choicesRoot.querySelector('p.choice.answer').textContent;
		quiz.querySelector('div.answer p.answer').textContent = answer;

		// リザルトに表示
		const quizResult = document.createElement('p');
		quizResult.innerHTML = `${i+1}問目：<span class="answer"></span>`;
		root.querySelector('div.quizes').appendChild(quizResult);
	}

	// リザルト
	document.getElementById('result-quiz-all').textContent = quizCount;
}