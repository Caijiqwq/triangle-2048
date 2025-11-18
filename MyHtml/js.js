//三角版2048
let data1 = [0, 2,0, 0,0,0, 0,0,0,1024];
let data2 = [0, 2,0, 0,0,2048];
let data = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
const indexLeft=[15,8,14,13,3,7,6,12,11,0,2,1,5,4,10,9];
const indexRight=[9,4,10,11,1,5,6,12,13,0,2,3,7,8,14,15];
let colorArray = ['#c5beb6ff','#e2ca9eff','#F2B179','#F59563','#F67C5F','#F65E3B','#EDCF72','#EDCC61','#b89a37ff','#806611ff','#abe91aff'];
// 深色主题用的调色板（偏冷、低饱和度，保持可读性）
let colorArrayDark = ['#2b2b2b','#3a3a3a','#5a4b3a','#6a4b3a','#7a4b3a','#8b4b3a','#4a3a2a','#564427','#6b5a2a','#4f3e1b','#3c4a2b'];
// markers for animations
let spawnMarkersData = new Array(16).fill(false);
let mergeMarkersData = new Array(16).fill(false);
// convenience per-array markers (mapped in splitData)
let spawnMarkers1 = new Array(10).fill(false);
let spawnMarkers2 = new Array(6).fill(false);
let mergeMarkers1 = new Array(10).fill(false);
let mergeMarkers2 = new Array(6).fill(false);
// game over flag
let GAME_OVER = false;
// victory flag to avoid repeated popup
let VICTORY_SHOWN = false;

// score state and helpers
let score = 0;
function renderScore() {
    const el = document.getElementById('score-value');
    if (el) el.textContent = String(score);
}
function addScore(n) {
    if (typeof n !== 'number' || n <= 0) return;
    score += n;
    renderScore();
    // update best if needed (persisted)
    updateBestIfNeeded();
}
function resetScore() {
    score = 0;
    renderScore();
    // hide any game-over UI and allow input
    hideGameOver();
    hideVictory();
    VICTORY_SHOWN = false;
    createData();
    build();
}
function finalScore() {
    const el = document.getElementById('final-score');
    if(el) el.textContent="你的最终得分是："+String(score);
}

// best score (localStorage)
let bestScore = 0;
const BEST_KEY = 'tri2048_bestScore';
function renderBest() {
    const el = document.getElementById('best-value');
    if (el) el.textContent = String(bestScore);
}
function loadBest() {
    try {
        const v = localStorage.getItem(BEST_KEY);
        if (v !== null) {
            const n = parseInt(v, 10);
            if (!isNaN(n)) bestScore = n;
        }
    } catch (e) {
        console.warn('loadBest error', e);
    }
    renderBest();
}
function updateBestIfNeeded() {
    if (score > bestScore) {
        bestScore = score;
        try {
            localStorage.setItem(BEST_KEY, String(bestScore));
        } catch (e) {
            console.warn('save best failed', e);
        }
        // add highlight class briefly
        renderBest();
        const el = document.getElementById('best-value');
        if (el) {
            el.classList.add('best-highlight');
            setTimeout(() => el.classList.remove('best-highlight'), 900);
        }
    }
}
function createData() {
    for(let i=0;i<10;i++) {
        data1[i]=0;
    }
    for(let i=0;i<6;i++) {
        data2[i]=0;
    }
    let a=Math.floor(Math.random()*10);
    let b=Math.floor(Math.random()*6);
    let c=Math.floor(Math.random()*2)+1;
    let d=Math.floor(Math.random()*2)+1;
    data1[a]=c*2;
    data2[b]=d*2;
    //data1 = [2,4,8,16,32,64,128,256,512,1024];
    //data2 = [2,4,8,16,32,2048];
}

function mergeData() {
    data[0]=data1[0];
    data[1]=data1[1],data[2]=data2[0],data[3]=data1[2];
    data[4]=data1[3],data[5]=data2[1],data[6]=data1[4],data[7]=data2[2],data[8]=data1[5];
    data[9]=data1[6],data[10]=data2[3],data[11]=data1[7],data[12]=data2[4],data[13]=data1[8],data[14]=data2[5],data[15]=data1[9];
}

function splitData() {
    // map main data back into data1 and data2
    // and also map spawn/merge markers for animation
    data1[0] = data[0];
    spawnMarkers1[0] = !!spawnMarkersData[0]; mergeMarkers1[0] = !!mergeMarkersData[0];

    data1[1] = data[1]; spawnMarkers1[1] = !!spawnMarkersData[1]; mergeMarkers1[1] = !!mergeMarkersData[1];
    data2[0] = data[2]; spawnMarkers2[0] = !!spawnMarkersData[2]; mergeMarkers2[0] = !!mergeMarkersData[2];
    data1[2] = data[3]; spawnMarkers1[2] = !!spawnMarkersData[3]; mergeMarkers1[2] = !!mergeMarkersData[3];

    data1[3] = data[4]; spawnMarkers1[3] = !!spawnMarkersData[4]; mergeMarkers1[3] = !!mergeMarkersData[4];
    data2[1] = data[5]; spawnMarkers2[1] = !!spawnMarkersData[5]; mergeMarkers2[1] = !!mergeMarkersData[5];
    data1[4] = data[6]; spawnMarkers1[4] = !!spawnMarkersData[6]; mergeMarkers1[4] = !!mergeMarkersData[6];
    data2[2] = data[7]; spawnMarkers2[2] = !!spawnMarkersData[7]; mergeMarkers2[2] = !!mergeMarkersData[7];
    data1[5] = data[8]; spawnMarkers1[5] = !!spawnMarkersData[8]; mergeMarkers1[5] = !!mergeMarkersData[8];

    data1[6] = data[9]; spawnMarkers1[6] = !!spawnMarkersData[9]; mergeMarkers1[6] = !!mergeMarkersData[9];
    data2[3] = data[10]; spawnMarkers2[3] = !!spawnMarkersData[10]; mergeMarkers2[3] = !!mergeMarkersData[10];
    data1[7] = data[11]; spawnMarkers1[7] = !!spawnMarkersData[11]; mergeMarkers1[7] = !!mergeMarkersData[11];
    data2[4] = data[12]; spawnMarkers2[4] = !!spawnMarkersData[12]; mergeMarkers2[4] = !!mergeMarkersData[12];
    data1[8] = data[13]; spawnMarkers1[8] = !!spawnMarkersData[13]; mergeMarkers1[8] = !!mergeMarkersData[13];
    data2[5] = data[14]; spawnMarkers2[5] = !!spawnMarkersData[14]; mergeMarkers2[5] = !!mergeMarkersData[14];
    data1[9] = data[15]; spawnMarkers1[9] = !!spawnMarkersData[15]; mergeMarkers1[9] = !!mergeMarkersData[15];
}
function dataUpdate(operate) {
    // prepare
    mergeData();
    spawnMarkersData.fill(false);
    mergeMarkersData.fill(false);
    // capture previous total to compute score gain from merges (exclude spawned tile)
    const prevSum = data.reduce((s, v) => s + v, 0);
    let flag = false;
    let newScore = 0;
    let isHecheng = new Array(16).fill(false);
    if (operate === 'x') { // 水平向右
        for (let i = 2; i >= 1; i--) {
            for (let j = i; j <= 2; j++) {
                if (data[j] === 0) break;
                else if (data[j] !== 0 && data[j + 1] === 0) {
                    flag = true;
                    data[j + 1] = data[j];
                    data[j] = 0;
                }
                else if (data[j] !== 0 && data[j] === data[j + 1] && isHecheng[j + 1] === false) {
                    flag = true;
                    data[j + 1] = data[j] * 2;
                    mergeMarkersData[j + 1] = true;
                    newScore += data[j + 1];
                    data[j] = 0;
                    isHecheng[j + 1] = true;
                    break;
                }
                else if (data[j + 1] !== 0) break;
            }
        }
        for (let i = 7; i >= 4; i--) {
            for (let j = i; j <= 7; j++) {
                if (data[j] === 0) break;
                else if (data[j] !== 0 && data[j + 1] === 0) {
                    flag = true;
                    data[j + 1] = data[j];
                    data[j] = 0;
                }
                else if (data[j] !== 0 && data[j] === data[j + 1] && isHecheng[j + 1] === false) {
                    flag = true;
                    data[j + 1] = data[j] * 2;
                    mergeMarkersData[j + 1] = true;
                    newScore += data[j + 1];
                    data[j] = 0;
                    isHecheng[j + 1] = true;
                    break;
                }
                else if (data[j + 1] !== 0) break;
            }
        }
        for (let i = 14; i >= 9; i--) {
            for (let j = i; j <= 14; j++) {
                if (data[j] === 0) break;
                else if (data[j] !== 0 && data[j + 1] === 0) {
                    flag = true;
                    data[j + 1] = data[j];
                    data[j] = 0;
                }
                else if (data[j] !== 0 && data[j] === data[j + 1] && isHecheng[j + 1] === false) {
                    flag = true;
                    data[j + 1] = data[j] * 2;
                    mergeMarkersData[j + 1] = true;
                    newScore += data[j + 1];
                    data[j] = 0;
                    isHecheng[j + 1] = true;
                    break;
                }
                else if (data[j + 1] !== 0) break;
            }
        }
    }
    else if (operate === 'z') { // 水平向左
        for (let i = 2; i <= 3; i++) {
            for (let j = i; j >= 2; j--) {
                if (data[j] === 0) break;
                else if (data[j] !== 0 && data[j - 1] === 0) {
                    flag = true;
                    data[j - 1] = data[j];
                    data[j] = 0;
                }
                else if (data[j] !== 0 && data[j] === data[j - 1] && isHecheng[j - 1] === false) {
                    flag = true;
                    data[j - 1] = data[j] * 2;
                    mergeMarkersData[j - 1] = true;
                    newScore += data[j - 1];
                    data[j] = 0;
                    isHecheng[j - 1] = true;
                    break;
                }
                else if (data[j - 1] !== 0) break;
            }
        }
        for (let i = 5; i <= 8; i++) {
            for (let j = i; j >= 5; j--) {
                if (data[j] === 0) break;
                else if (data[j] !== 0 && data[j - 1] === 0) {
                    flag = true;
                    data[j - 1] = data[j];
                    data[j] = 0;
                }
                else if (data[j] !== 0 && data[j] === data[j - 1] && isHecheng[j - 1] === false) {
                    flag = true;
                    data[j - 1] = data[j] * 2;
                    mergeMarkersData[j - 1] = true;
                    newScore += data[j - 1];
                    data[j] = 0;
                    isHecheng[j - 1] = true;
                    break;
                }
                else if (data[j - 1] !== 0) break;
            }
        }
        for (let i = 10; i <= 15; i++) {
            for (let j = i; j >= 10; j--) {
                if (data[j] === 0) break;
                else if (data[j] !== 0 && data[j - 1] === 0) {
                    flag = true;
                    data[j - 1] = data[j];
                    data[j] = 0;
                }
                else if (data[j] !== 0 && data[j] === data[j - 1] && isHecheng[j - 1] === false) {
                    flag = true;
                    data[j - 1] = data[j] * 2;
                    mergeMarkersData[j - 1] = true;
                    newScore += data[j - 1];
                    data[j] = 0;
                    isHecheng[j - 1] = true;
                    break;
                }
                else if (data[j - 1] !== 0) break;
            }
        }
    }
    else if (operate === 'a') { // 向左下
        for (let i = 2; i >= 1; i--) {
            for (let j = i; j <= 2; j++) {
                const idx = indexLeft[j];
                const idxNext = indexLeft[j + 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxNext] === 0) {
                    flag = true;
                    data[idxNext] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxNext] && isHecheng[idxNext] === false) {
                    flag = true;
                    data[idxNext] = data[idx] * 2;
                    mergeMarkersData[idxNext] = true;
                    newScore += data[idxNext];
                    data[idx] = 0;
                    isHecheng[idxNext] = true;
                    break;
                }
                else if (data[idxNext] !== 0) break;
            }
        }
        for (let i = 7; i >= 4; i--) {
            for (let j = i; j <= 7; j++) {
                const idx = indexLeft[j];
                const idxNext = indexLeft[j + 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxNext] === 0) {
                    flag = true;
                    data[idxNext] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxNext] && isHecheng[idxNext] === false) {
                    flag = true;
                    data[idxNext] = data[idx] * 2;
                    mergeMarkersData[idxNext] = true;
                    newScore += data[idxNext];
                    data[idx] = 0;
                    isHecheng[idxNext] = true;
                    break;
                }
                else if (data[idxNext] !== 0) break;
            }
        }
        for (let i = 14; i >= 9; i--) {
            for (let j = i; j <= 14; j++) {
                const idx = indexLeft[j];
                const idxNext = indexLeft[j + 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxNext] === 0) {
                    flag = true;
                    data[idxNext] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxNext] && isHecheng[idxNext] === false) {
                    flag = true;
                    data[idxNext] = data[idx] * 2;
                    mergeMarkersData[idxNext] = true;
                    newScore += data[idxNext];
                    data[idx] = 0;
                    isHecheng[idxNext] = true;
                    break;
                }
                else if (data[idxNext] !== 0) break;
            }
        }
    }
    else if (operate === 'w') { // 向右上
        for (let i = 2; i <= 3; i++) {
            for (let j = i; j >= 2; j--) {
                const idx = indexLeft[j];
                const idxPrev = indexLeft[j - 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxPrev] === 0) {
                    flag = true;
                    data[idxPrev] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxPrev] && isHecheng[idxPrev] === false) {
                    flag = true;
                    data[idxPrev] = data[idx] * 2;
                    mergeMarkersData[idxPrev] = true;
                    newScore += data[idxPrev];
                    data[idx] = 0;
                    isHecheng[idxPrev] = true;
                    break;
                }
                else if (data[idxPrev] !== 0) break;
            }
        }
        for (let i = 5; i <= 8; i++) {
            for (let j = i; j >= 5; j--) {
                const idx = indexLeft[j];
                const idxPrev = indexLeft[j - 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxPrev] === 0) {
                    flag = true;
                    data[idxPrev] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxPrev] && isHecheng[idxPrev] === false) {
                    flag = true;
                    data[idxPrev] = data[idx] * 2;
                    mergeMarkersData[idxPrev] = true;
                    newScore += data[idxPrev];
                    data[idx] = 0;
                    isHecheng[idxPrev] = true;
                    break;
                }
                else if (data[idxPrev] !== 0) break;
            }
        }
        for (let i = 10; i <= 15; i++) {
            for (let j = i; j >= 10; j--) {
                const idx = indexLeft[j];
                const idxPrev = indexLeft[j - 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxPrev] === 0) {
                    flag = true;
                    data[idxPrev] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxPrev] && isHecheng[idxPrev] === false) {
                    flag = true;
                    data[idxPrev] = data[idx] * 2;
                    mergeMarkersData[idxPrev] = true;
                    newScore += data[idxPrev];
                    data[idx] = 0;
                    isHecheng[idxPrev] = true;
                    break;
                }
                else if (data[idxPrev] !== 0) break;
            }
        }
    }
    else if (operate === 'd') { // 向右下
        for (let i = 2; i >= 1; i--) {
            for (let j = i; j <= 2; j++) {
                const idx = indexRight[j];
                const idxNext = indexRight[j + 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxNext] === 0) {
                    flag = true;
                    data[idxNext] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxNext] && isHecheng[idxNext] === false) {
                    flag = true;
                    data[idxNext] = data[idx] * 2;
                    mergeMarkersData[idxNext] = true;
                    newScore += data[idxNext];
                    data[idx] = 0;
                    isHecheng[idxNext] = true;
                    break;
                }
                else if (data[idxNext] !== 0) break;
            }
        }
        for (let i = 7; i >= 4; i--) {
            for (let j = i; j <= 7; j++) {
                const idx = indexRight[j];
                const idxNext = indexRight[j + 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxNext] === 0) {
                    flag = true;
                    data[idxNext] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxNext] && isHecheng[idxNext] === false) {
                    flag = true;
                    data[idxNext] = data[idx] * 2;
                    mergeMarkersData[idxNext] = true;
                    newScore += data[idxNext];
                    data[idx] = 0;
                    isHecheng[idxNext] = true;
                    break;
                }
                else if (data[idxNext] !== 0) break;
            }
        }
        for (let i = 14; i >= 9; i--) {
            for (let j = i; j <= 14; j++) {
                const idx = indexRight[j];
                const idxNext = indexRight[j + 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxNext] === 0) {
                    flag = true;
                    data[idxNext] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxNext] && isHecheng[idxNext] === false) {
                    flag = true;
                    data[idxNext] = data[idx] * 2;
                    mergeMarkersData[idxNext] = true;
                    newScore += data[idxNext];
                    data[idx] = 0;
                    isHecheng[idxNext] = true;
                    break;
                }
                else if (data[idxNext] !== 0) break;
            }
        }
    }
    else if (operate === 'e') { // 向左上
        for (let i = 2; i <= 3; i++) {
            for (let j = i; j >= 2; j--) {
                const idx = indexRight[j];
                const idxPrev = indexRight[j - 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxPrev] === 0) {
                    flag = true;
                    data[idxPrev] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxPrev] && isHecheng[idxPrev] === false) {
                    flag = true;
                    data[idxPrev] = data[idx] * 2;
                    mergeMarkersData[idxPrev] = true;
                    newScore += data[idxPrev];
                    data[idx] = 0;
                    isHecheng[idxPrev] = true;
                    break;
                }
                else if (data[idxPrev] !== 0) break;
            }
        }
        for (let i = 5; i <= 8; i++) {
            for (let j = i; j >= 5; j--) {
                const idx = indexRight[j];
                const idxPrev = indexRight[j - 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxPrev] === 0) {
                    flag = true;
                    data[idxPrev] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxPrev] && isHecheng[idxPrev] === false) {
                    flag = true;
                    data[idxPrev] = data[idx] * 2;
                    mergeMarkersData[idxPrev] = true;
                    newScore += data[idxPrev];
                    data[idx] = 0;
                    isHecheng[idxPrev] = true;
                    break;
                }
                else if (data[idxPrev] !== 0) break;
            }
        }
        for (let i = 10; i <= 15; i++) {
            for (let j = i; j >= 10; j--) {
                const idx = indexRight[j];
                const idxPrev = indexRight[j - 1];
                if (data[idx] === 0) break;
                else if (data[idx] !== 0 && data[idxPrev] === 0) {
                    flag = true;
                    data[idxPrev] = data[idx];
                    data[idx] = 0;
                }
                else if (data[idx] !== 0 && data[idx] === data[idxPrev] && isHecheng[idxPrev] === false) {
                    flag = true;
                    data[idxPrev] = data[idx] * 2;
                    mergeMarkersData[idxPrev] = true;
                    newScore += data[idxPrev];
                    data[idx] = 0;
                    isHecheng[idxPrev] = true;
                    break;
                }
                else if (data[idxPrev] !== 0) break;
            }
        }
    }
    for (let i = 0; i <= 15; i++) {
        isHecheng[i] = false;
    }
    if (flag) {
        let emptyIndices = [];
        for (let i = 0; i <= 15; i++) {
            if (data[i] === 0) {
                emptyIndices.push(i);
            }
        }
        if (emptyIndices.length > 0) {
            let randIndex = Math.floor(Math.random() * emptyIndices.length);
            let dataIndex = emptyIndices[randIndex];
            let twoOrFour = Math.random() < 0.9 ? 2 : 4;
            data[dataIndex] = twoOrFour;
            spawnMarkersData[dataIndex] = true;
        }
    }

    // compute score gain: newSum - prevSum - spawned tile (spawned tile shouldn't count toward merge score)
    const gain = newScore;
    if (gain > 0) addScore(gain);

    splitData();
}

function createTriangle(type, value, marker) {
	// type: 'up' or 'down'
	const el = document.createElement('div');
	el.className = type === 'up' ? 'clip-triangle-up' : 'clip-triangle-down';
	if (value !== 0 && value !== null && value !== undefined) {
		const inner = document.createElement('div');
		inner.className = 'small-triangle p ' + (type === 'up' ? 'up' : 'down');
		inner.textContent = String(value);
		// ensure parent is positioned so absolute inside can work if needed
        // choose palette according to theme
        const isDark = document.documentElement && document.documentElement.classList && document.documentElement.classList.contains('dark-theme');
        const palette = isDark ? colorArrayDark : colorArray;
        for (let i = 1; i <= 11; i++) {
            if (value == Math.pow(2, i)) {
                // for 2048 use special class so CSS can apply glow
                if (value === 2048) {
                    inner.classList.add('tile-2048');
                    // ensure 2048 text is readable in dark mode — set inline !important color to override CSS
                    if (isDark) inner.style.setProperty('color', '#ffffff', 'important');
                    else inner.style.setProperty('color', '#1b1b1b', 'important');
                } else {
                    // guard palette index and set tile background
                    if (palette && palette[i - 1]) inner.style.backgroundColor = palette[i - 1];
                    // set text color for readability
                    inner.style.color = isDark ? '#ffffff' : '#1b1b1b';
                }
                if (i >= 7 && i <= 9) {
                    inner.style.fontSize = '24px';
                }
                if (i >= 10) {
                    inner.style.fontSize = '20px';
                }
                break;
            }
        }
		el.style.position = 'relative';
		inner.style.position = 'absolute';
        // add animation classes when requested
        if (marker === 'spawn') {
            inner.classList.add('tile-pop');
        } else if (marker === 'merge') {
            inner.classList.add('tile-merge');
        }
        //inner.style.left = '50%';
        //inner.style.top = '50%';
        //inner.style.transform = 'translate(-50%, -50%)';
		el.appendChild(inner);
	}
	return el;
}

function isGameOver() {
    // check if any move is possible
    const directions = ['x', 'z', 'a', 'w', 'd', 'e'];
    let flag1 = false;
    //水平向右
    for (let i = 2; i >= 1; i--) {
        for (let j = i; j <= 2; j++) {
            if (data[j] === 0) break;
            else if (data[j] !== 0 && data[j + 1] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[j] !== 0 && data[j] === data[j + 1]) {
                flag1 = true;
                return flag1;
            }
            else if (data[j + 1] !== 0) break;
        }
    }
    for (let i = 7; i >= 4; i--) {
        for (let j = i; j <= 7; j++) {
            if (data[j] === 0) break;
            else if (data[j] !== 0 && data[j + 1] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[j] !== 0 && data[j] === data[j + 1]) {
                flag1 = true;
                return flag1;
            }
            else if (data[j + 1] !== 0) break;
        }
    }
    for (let i = 14; i >= 9; i--) {
        for (let j = i; j <= 14; j++) {
            if (data[j] === 0) break;
            else if (data[j] !== 0 && data[j + 1] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[j] !== 0 && data[j] === data[j + 1]) {
                flag1 = true;
                return flag1;
            }
            else if (data[j + 1] !== 0) break;
        }
    }
    //水平向左
    for (let i = 2; i <= 3; i++) {
        for (let j = i; j >= 2; j--) {
            if (data[j] === 0) break;
            else if (data[j] !== 0 && data[j - 1] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[j] !== 0 && data[j] === data[j - 1]) {
                flag1 = true;
                return flag1;
            }
            else if (data[j - 1] !== 0) break;
        }
    }
    for (let i = 5; i <= 8; i++) {
        for (let j = i; j >= 5; j--) {
            if (data[j] === 0) break;
            else if (data[j] !== 0 && data[j - 1] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[j] !== 0 && data[j] === data[j - 1]) {
                flag1 = true;
                return flag1;
            }
            else if (data[j - 1] !== 0) break;
        }
    }
    for (let i = 10; i <= 15; i++) {
        for (let j = i; j >= 10; j--) {
            if (data[j] === 0) break;
            else if (data[j] !== 0 && data[j - 1] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[j] !== 0 && data[j] === data[j - 1]) {
                flag1 = true;
                return flag1;
            }
            else if (data[j - 1] !== 0) break;
        }
    }
    //向左下
    for (let i = 2; i >= 1; i--) {
        for (let j = i; j <= 2; j++) {
            const idx = indexLeft[j];
            const idxNext = indexLeft[j + 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxNext] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxNext]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxNext] !== 0) break;
        }
    }
    for (let i = 7; i >= 4; i--) {
        for (let j = i; j <= 7; j++) {
            const idx = indexLeft[j];
            const idxNext = indexLeft[j + 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxNext] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxNext]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxNext] !== 0) break;
        }
    }
    for (let i = 14; i >= 9; i--) {
        for (let j = i; j <= 14; j++) {
            const idx = indexLeft[j];
            const idxNext = indexLeft[j + 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxNext] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxNext]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxNext] !== 0) break;
        }
    }
    //向右上
    for (let i = 2; i <= 3; i++) {
        for (let j = i; j >= 2; j--) {
            const idx = indexLeft[j];
            const idxPrev = indexLeft[j - 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxPrev] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxPrev]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxPrev] !== 0) break;
        }
    }
    for (let i = 5; i <= 8; i++) {
        for (let j = i; j >= 5; j--) {
            const idx = indexLeft[j];
            const idxPrev = indexLeft[j - 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxPrev] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxPrev]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxPrev] !== 0) break;
        }
    }
    for (let i = 10; i <= 15; i++) {
        for (let j = i; j >= 10; j--) {
            const idx = indexLeft[j];
            const idxPrev = indexLeft[j - 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxPrev] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxPrev]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxPrev] !== 0) break;
        }
    }
    //向右下
    for (let i = 2; i >= 1; i--) {
        for (let j = i; j <= 2; j++) {
            const idx = indexRight[j];
            const idxNext = indexRight[j + 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxNext] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxNext]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxNext] !== 0) break;
        }
    }
    for (let i = 7; i >= 4; i--) {
        for (let j = i; j <= 7; j++) {
            const idx = indexRight[j];
            const idxNext = indexRight[j + 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxNext] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxNext]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxNext] !== 0) break;
        }
    }
    for (let i = 14; i >= 9; i--) {
        for (let j = i; j <= 14; j++) {
            const idx = indexRight[j];
            const idxNext = indexRight[j + 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxNext] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxNext]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxNext] !== 0) break;
        }
    }
    //向左上
    for (let i = 2; i <= 3; i++) {
        for (let j = i; j >= 2; j--) {
            const idx = indexRight[j];
            const idxPrev = indexRight[j - 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxPrev] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxPrev]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxPrev] !== 0) break;
        }
    }
    for (let i = 5; i <= 8; i++) {
        for (let j = i; j >= 5; j--) {
            const idx = indexRight[j];
            const idxPrev = indexRight[j - 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxPrev] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxPrev]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxPrev] !== 0) break;
        }
    }
    for (let i = 10; i <= 15; i++) {
        for (let j = i; j >= 10; j--) {
            const idx = indexRight[j];
            const idxPrev = indexRight[j - 1];
            if (data[idx] === 0) break;
            else if (data[idx] !== 0 && data[idxPrev] === 0) {
                flag1 = true;
                return flag1;
            }
            else if (data[idx] !== 0 && data[idx] === data[idxPrev]) {
                flag1 = true;
                return flag1;
            }
            else if (data[idxPrev] !== 0) break;
        }
    }
    return flag1;
}

// show/hide game-over overlay
function showGameOver() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        finalScore();
        overlay.classList.add('show');
    }
    GAME_OVER = true;
}
function hideGameOver() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
    GAME_OVER = false;
}

function checkGameState() {
    try {
        // ensure flattened data[] matches data1/data2 before checking
        mergeData();
        // isGameOver returns true when NOT finished (per your note); false when ended
        const notEnded = isGameOver();
        if (!notEnded) {
            // game ended
            showGameOver();
        }
    } catch (e) {
        console.error('checkGameState error', e);
    }
}

// victory overlay handling
function showVictory() {
    if (VICTORY_SHOWN) return;
    const overlay = document.getElementById('victory-overlay');
    if (overlay) overlay.classList.add('show');
    VICTORY_SHOWN = true;
}
function hideVictory() {
    const overlay = document.getElementById('victory-overlay');
    if (overlay) overlay.classList.remove('show');
}

function checkVictory() {
    try {
        // ensure data is up-to-date
        mergeData();
        // if any tile equals 2048 and we haven't shown victory yet, show it
        for (let i = 0; i < data.length; i++) {
            if (data[i] === 2048) {
                showVictory();
                return true;
            }
        }
        return false;
    } catch (e) {
        console.error('checkVictory error', e);
        return false;
    }
}

function build() {
	// Build upward big triangle (4 rows: 1,2,3,4)
	const upContainer = document.querySelector('.big-triangle');
	// If the static HTML already contains rows, clear them and rebuild
	if (upContainer) {
		upContainer.innerHTML = '';
		let idx = 0;
		for (let row = 1; row <= 4; row++) {
			const rowDiv = document.createElement('div');
			rowDiv.className = 'triangle-row';
			for (let col = 0; col < row; col++) {
                const val = data1[idx] || 0;
                let marker = null;
                if (spawnMarkers1[idx]) marker = 'spawn';
                else if (mergeMarkers1[idx]) marker = 'merge';
                const tri = createTriangle('up', val, marker);
				rowDiv.appendChild(tri);
				idx++;
			}
			upContainer.appendChild(rowDiv);
		}
	}

	// Build downward triangles into #down-triangles (3 rows: 1,2,3 but starting with an empty row to align)
	const downContainer = document.getElementById('down-triangles');
	if (downContainer) {
		downContainer.innerHTML = '';
		// To visually match the original structure, add an empty row first
		const emptyRow = document.createElement('div');
		emptyRow.className = 'triangle-row';
		downContainer.appendChild(emptyRow);

        let idx = 0; 
		// Note: original static had a different layout; here we place 1,2,3 downward triangles
		for (let row = 1; row <= 3; row++) {
			const rowDiv = document.createElement('div');
			rowDiv.className = 'triangle-row';
			for (let col = 0; col < row; col++) {
                const val = data2[idx] || 0;
                let marker = null;
                if (spawnMarkers2[idx]) marker = 'spawn';
                else if (mergeMarkers2[idx]) marker = 'merge';
                const tri = createTriangle('down', val, marker);
				rowDiv.appendChild(tri);
				idx++;
			}
			downContainer.appendChild(rowDiv);
		}
	}

    // clear per-build markers after rendering (so next build is clean)
    spawnMarkers1.fill(false);
    spawnMarkers2.fill(false);
    mergeMarkers1.fill(false);
    mergeMarkers2.fill(false);
    spawnMarkersData.fill(false);
    mergeMarkersData.fill(false);
}

document.addEventListener('DOMContentLoaded', () => {
	try {
    // load best score from localStorage, then build
    loadBest();
    createData();
    //data1[0] = 2048;
    build();
    // check game state after initial build
    checkGameState();
    // check victory (2048) after initial build
    checkVictory();
    // render initial score and best, and bind buttons
    renderScore();
    renderBest();
    const addBtn = document.getElementById('add-score-btn');
    const resetBtn = document.getElementById('reset-score-btn');
    if (addBtn) addBtn.addEventListener('click', () => { addScore(1); });
    if (resetBtn) resetBtn.addEventListener('click', () => { resetScore(); });
    // restart button on overlay
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) restartBtn.addEventListener('click', () => { resetScore(); hideGameOver(); });
    // victory buttons
    const victoryEnd = document.getElementById('victory-end');
    const victoryContinue = document.getElementById('victory-continue');
    if (victoryEnd) victoryEnd.addEventListener('click', () => { hideVictory(); resetScore();});
    if (victoryContinue) victoryContinue.addEventListener('click', () => { hideVictory(); });

    // Theme toggle: simple sun/moon toggle stored in localStorage
    const THEME_KEY = 'tri2048_theme';
    function applyTheme(name) {
        // toggle dark-theme class
        if (name === 'dark') document.documentElement.classList.add('dark-theme');
        else document.documentElement.classList.remove('dark-theme');
        // show/hide the two background videos by display only (no play/load)
        try {
            const v1 = document.getElementById('bg-video');
            const v2 = document.getElementById('bg-video-2');
            if (name === 'dark') {
                if (v1) v1.style.display = 'none';
                if (v2) v2.style.display = 'block';
            } else {
                if (v2) v2.style.display = 'none';
                if (v1) v1.style.display = 'block';
            }
        } catch (e) { /* ignore video errors */ }
        // set triangle background CSS variables so CSS can pick appropriate backgrounds
        try {
            if (name === 'dark') {
                document.documentElement.style.setProperty('--tri-up-bg', 'linear-gradient(135deg, rgba(48, 48, 58, 0.85) 0%, rgba(48,48,58,0.85) 100%)');
                document.documentElement.style.setProperty('--tri-down-bg', 'linear-gradient(135deg, rgba(34,34,40,0.82) 0%, rgba(28,28,32,0.82) 100%)');
            } else {
                document.documentElement.style.setProperty('--tri-up-bg', 'linear-gradient(45deg, #EEE4DA, #EEE4DA)');
                document.documentElement.style.setProperty('--tri-down-bg', 'linear-gradient(45deg, #d6c7b8, #d6c7b8)');
            }
        } catch (e) { /* ignore */ }
        // Rebuild board so tiles pick up new palette immediately
        try { build(); } catch (e) { /* ignore */ }
    }
    function loadThemePref() {
        try {
            const v = localStorage.getItem(THEME_KEY);
            if (v === 'dark' || v === 'light') { applyTheme(v); return; }
            // fallback to system
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark');
        } catch (e) { /* ignore */ }
    }
    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark-theme');
        const next = isDark ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
    }
    loadThemePref();
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
    // Board hide/show toggle (persisted)
    const BOARD_KEY = 'tri2048_boardHidden';
    function applyBoardHidden(hidden, skipSave) {
        try {
            const board = document.getElementById('board');
            const btn = document.getElementById('toggle-board-btn');
            if (board) {
                if (hidden) board.classList.add('board-hidden');
                else board.classList.remove('board-hidden');
            }
            if (btn) {
                btn.classList.toggle('is-hidden', !!hidden);
                btn.setAttribute('aria-pressed', hidden ? 'true' : 'false');
                btn.title = hidden ? '显示棋盘' : '隐藏棋盘';
            }
            if (!skipSave) {
                try { localStorage.setItem(BOARD_KEY, hidden ? '1' : '0'); } catch (e) { /* ignore */ }
            }
        } catch (e) { /* ignore */ }
    }
    function loadBoardPref() {
        try {
            const v = localStorage.getItem(BOARD_KEY);
            if (v === '1') applyBoardHidden(true, true);
            else applyBoardHidden(false, true);
        } catch (e) { /* ignore */ }
    }
    function toggleBoard() {
        try {
            const board = document.getElementById('board');
            if (!board) return;
            const hidden = board.classList.contains('board-hidden');
            applyBoardHidden(!hidden);
        } catch (e) { /* ignore */ }
    }
    const toggleBoardBtn = document.getElementById('toggle-board-btn');
    if (toggleBoardBtn) toggleBoardBtn.addEventListener('click', toggleBoard);
    // load board hidden state after bindings
    loadBoardPref();
	} catch (e) {
		console.error('build error:', e);
	}
});

document.addEventListener('keydown', function(event){
    if (GAME_OVER) return; // ignore input when game over
    dataUpdate(event.key);
    build();
    // after build, check if game ended
    checkGameState();
    // after build check victory condition
    checkVictory();
});