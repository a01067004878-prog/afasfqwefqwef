// 로컬스토리지에 저장할 키 이름
const STORAGE_KEY = 'billiards_game_history';

// DOM 요소 가져오기
const gameForm = document.getElementById('game-form');
const gameTypeInput = document.getElementById('game-type');
const myScoreInput = document.getElementById('my-score');
const oppScoreInput = document.getElementById('opp-score');
const inningsInput = document.getElementById('innings');
const matchResultInput = document.getElementById('match-result');

const tableBody = document.getElementById('history-table-body');
const noDataMsg = document.getElementById('no-data-msg');

// 대시보드 엘리먼트
const statTotalGames = document.getElementById('stat-total-games');
const statWinRate = document.getElementById('stat-win-rate');
const statAvgAvg = document.getElementById('stat-avg-avg');

// 어플리케이션 상태 데이터
let games = [];

// 1. 초기화 함수
function init() {
    // 로컬스토리지에서 데이터 불러오기
    const storedGames = localStorage.getItem(STORAGE_KEY);
    if (storedGames) {
        games = JSON.parse(storedGames);
    }
    
    // 화면 갱신
    render();
}

// 2. 데이터 기반 화면 렌더링 함수
function render() {
    renderTable();
    renderDashboard();
}

// 3. 히스토리 테이블 렌더링
function renderTable() {
    tableBody.innerHTML = '';
    
    if (games.length === 0) {
        noDataMsg.style.display = 'block';
        return;
    }
    
    noDataMsg.style.display = 'none';

    // 최신 경기가 위에 오도록 역순 배치
    const reversedGames = [...games].reverse();

    reversedGames.forEach((game, index) => {
        // 실제 원래 배열에서의 인덱스 계산 (삭제할 때 사용)
        const actualIndex = games.length - 1 - index;
        
        const tr = document.createElement('tr');
        
        // 단일 경기 에버리지 계산 (득점 / 이닝)
        const singleAvg = (game.myScore / game.innings).toFixed(3);

        tr.innerHTML = `
            <td>${game.date}</td>
            <td>${game.type}</td>
            <td><span class="badge ${game.result === '승' ? 'win' : 'lose'}">${game.result === '승' ? 'WIN' : 'LOSE'}</span></td>
            <td><strong>${game.myScore}</strong> : ${game.oppScore}</td>
            <td>${game.innings}</td>
            <td>${singleAvg}</td>
            <td><button class="btn-delete" onclick="deleteGame(${actualIndex})">삭제</button></td>
        `;
        tableBody.appendChild(tr);
    });
}

// 4. 대시보드 통계 업데이트
function renderDashboard() {
    const totalGames = games.length;
    
    if (totalGames === 0) {
        statTotalGames.textContent = '0';
        statWinRate.textContent = '0%';
        statAvgAvg.textContent = '0.000';
        return;
    }

    // 승리 횟수 계산
    const wins = games.filter(game => game.result === '승').length;
    const winRate = ((wins / totalGames) * 100).toFixed(1);

    // 통산 에버리지 계산 (총 득점 / 총 이닝)
    const totalMyScore = games.reduce((sum, game) => sum + game.myScore, 0);
    const totalInnings = games.reduce((sum, game) => sum + game.innings, 0);
    const totalAvg = (totalMyScore / totalInnings).toFixed(3);

    // 대시보드 텍스트 변경
    statTotalGames.textContent = totalGames;
    statWinRate.textContent = `${winRate}%`;
    statAvgAvg.textContent = totalAvg;
}

// 5. 경기 기록 등록 이벤트 핸들러
gameForm.addEventListener('submit', function(e) {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    // 오늘 날짜 구하기 (YYYY-MM-DD 형식)
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // 새 경기 객체 생성
    const newGame = {
        id: Date.now(),
        date: dateString,
        type: gameTypeInput.value,
        myScore: parseInt(myScoreInput.value),
        oppScore: parseInt(oppScoreInput.value),
        innings: parseInt(inningsInput.value),
        result: matchResultInput.value
    };

    // 상태 배열에 추가 및 로컬스토리지 저장
    games.push(newGame);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));

    // 화면 갱신 및 폼 리셋
    render();
    gameForm.reset();
});

// 6. 경기 기록 삭제 함수 (인라인 온클릭 호출용 글로벌 스코프 배치)
window.deleteGame = function(index) {
    if (confirm('이 경기 기록을 정말 삭제하시겠습니까?')) {
        games.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
        render();
    }
}

// 실행 시작
init();
