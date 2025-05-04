const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const progressCircle = document.querySelector(".progress-ring__circle");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const add10sBtn = document.getElementById("add10s");

const radius = 130;
const circumference = 2 * Math.PI * radius;

let disableSoundAt12 = false;


const startSound = new Audio("sound/countDown5s_perRound.mp3");
const dingDongSound = new Audio("sound/big_Ding.mp3");

let totalTime = 20;
let remainingTime = totalTime;
let timerInterval = null;
let isRunning = false;





const quickSetContainer = document.querySelector(".quick-set");




/*///////////////////*/

// Hiển thị các nút Quick Set khi nhấn Reset hoặc chỉnh sửa thời gian
function showQuickSetButtons() {
    if (isRunning) return;
    quickSetContainer.style.display = "flex"; // Hiện các nút Quick Set
}

function hideQuickSetButtons() {
    quickSetContainer.style.display = "none";
}

// Ẩn Quick Set khi bắt đầu
window.onload = function () {
    quickSetContainer.style.display = "flex";
};

// các sự kiện để ẩn hoặc hiện quickSetBTN 
resetBtn.addEventListener("click", showQuickSetButtons);
minutesEl.addEventListener("click", showQuickSetButtons);
secondsEl.addEventListener("click", showQuickSetButtons);
startPauseBtn.addEventListener("click", hideQuickSetButtons);

// Cập nhật hiển thị thời gian
function updateDisplay() {
    let minutes = Math.floor(remainingTime / 60);
    let seconds = remainingTime % 60;

    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds.toString().padStart(2, "0");

    if (remainingTime < 60) {
        minutesEl.style.display = "none";
        document.querySelector(".separator").style.display = "none";
        secondsEl.style.fontSize = "7rem";
    } else {
        minutesEl.style.display = "inline";
        document.querySelector(".separator").style.display = "inline";
        secondsEl.style.fontSize = "6rem";
    }

    // Cập nhật vòng tròn tiến trình
    const progress = circumference * (remainingTime / totalTime);
    progressCircle.style.strokeDashoffset = progress;

    // Đổi màu vòng tròn khi gần hết thời gian
    if (remainingTime <= 5) {
        progressCircle.style.stroke = "#FF0000"; // Màu đỏ khi sắp hết
    } else if (remainingTime <= totalTime / 2) {
        progressCircle.style.stroke = "#FFA500"; // Màu cam khi còn một nửa
    } else {
        progressCircle.style.stroke = "#00FF00"; // Màu xanh khi còn nhiều thời gian
    }
}



// Bắt đầu hoặc tạm dừng đếm ngược
function startPauseTimer() {
    if (isRunning) {
        startSound.pause();
        clearInterval(timerInterval);
        startPauseBtn.textContent = "▶"; // Hiển thị icon Play
        add10sBtn.style.display = "inline-block"; // Hiện nút +10s khi tạm dừng
    } else {
        timerInterval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime--;
                updateDisplay();

                if (remainingTime === 12 && !disableSoundAt12) {
                    dingDongSound.play();
                }
                if (remainingTime === 11 && disableSoundAt12) {
                    disableSoundAt12 = false;
                }

                if (remainingTime <= 5) startSound.play();
                if (remainingTime <= 0) startSound.pause();
            } else {
                clearInterval(timerInterval);
                isRunning = false;
                startPauseBtn.textContent = "▶";
            }
        }, 1000);
        startPauseBtn.textContent = "⏸";
        add10sBtn.style.display = "none"; // Ẩn nút +10s khi chạy
    }
    isRunning = !isRunning;
}




// Reset timer
function resetTimer() {

    //stop Sound
    startSound.pause();
    //reset default 0s
    startSound.currentTime = 0;

    clearInterval(timerInterval);
    isRunning = false;
    remainingTime = totalTime;
    updateDisplay();
    startPauseBtn.textContent = "▶";



}

// Xử lý chỉnh sửa số phút/giây bằng chuột
function enableEditing(element, type) {
    element.addEventListener("click", () => {
        if (isRunning) return; // Không cho chỉnh sửa nếu đang chạy

        let input = document.createElement("input");
        input.type = "number";
        input.value = element.textContent;
        input.style.width = "200px";
        input.style.fontSize = "10rem";
        input.style.textAlign = "center";
        input.style.background = "transparent";
        input.style.color = "white";
        input.style.fontWeight = "bold";
        input.style.appearance = "textfield";


        element.replaceWith(input);
        input.focus();

        // Xử lý giới hạn khi nhập
        input.addEventListener("input", () => {
            let value = input.value.replace(/\D/g, ""); // Chỉ giữ lại số

            if (type === "seconds") {
                value = Math.min(59, Math.max(0, parseInt(value) || 0)); // Giới hạn 0-59
            } else {
                value = Math.min(99, Math.max(0, parseInt(value) || 0)); // Giới hạn 0-99
            }
        });

        input.addEventListener("blur", () => saveInput(input, element, type));
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") saveInput(input, element, type);
        });
    });
}




function saveInput(input, element, type) {
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) value = 0;

    if (type === "seconds") {
        value = Math.min(59, value); // Giới hạn 0-59
        totalTime = Math.floor(totalTime / 60) * 60 + value; // Cập nhật lại giây trong tổng thời gian
    } else if (type === "minutes") {
        value = Math.min(99, value); // Giới hạn 0-99
        totalTime = value * 60 + (totalTime % 60); // Cập nhật lại phút trong tổng thời gian
    }

    remainingTime = totalTime; // Cập nhật lại thời gian còn lại
    element.textContent = value.toString().padStart(2, "0");
    input.replaceWith(element);
    updateDisplay();
}


document.querySelectorAll(".editable-team").forEach(team => {
    team.setAttribute("contenteditable", "true");
    team.style.cursor = "text";


    team.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            this.blur();
        }
    });
});



document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', function () {
        this.classList.toggle('active');
    });
});





document.querySelectorAll('.set-time').forEach(button => {
    button.addEventListener('click', function () {
        const time = parseInt(this.getAttribute('data-time'));
        setTimeDirectly(time);
    });
});

function setTimeDirectly(seconds) {
    totalTime = seconds;  // Cập nhật tổng thời gian
    remainingTime = seconds;  // Cập nhật thời gian còn lại

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = remainingSeconds.toString().padStart(2, '0');

    updateDisplay();
}




document.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "p") { // Kiểm tra nếu bấm "B" hoặc "b"
        let music = document.getElementById("backgroundMusic");

        if (music.paused) {
            music.play();
        } else {
            music.pause();
        }
    }
});


document.addEventListener("keydown", function (event) {
    if (event.code === "Space" && document.activeElement.contentEditable !== "true") {
        event.preventDefault();
        startPauseTimer();
        quickSetContainer.style.display = "none";
    }
});





document.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "r" && document.activeElement.contentEditable !== "true") {
        event.preventDefault();
        resetTimer();
        quickSetContainer.style.display = "flex";
    }
});



document.addEventListener("DOMContentLoaded", function () {
    // Lấy tất cả các input điểm số của từng đội
    const redInputs = document.querySelectorAll("#redScore .score");
    const blueInputs = document.querySelectorAll("#blueScore .score");

    // Lấy phần tử hiển thị tổng điểm
    const redScoreDisplay = document.getElementById("Score-red");
    const blueScoreDisplay = document.getElementById("Score-blue");

    // Hàm tính tổng điểm của một team
    function updateTeamScore(inputs, displayElement) {
        let totalScore = 0;
        inputs.forEach(input => {
            totalScore += parseInt(input.value) || 0; // Chuyển đổi sang số, nếu không hợp lệ thì là 0
        });
        displayElement.textContent = totalScore;
    }

    // Thêm sự kiện lắng nghe khi nhập số vào input của Red Team
    redInputs.forEach(input => {
        input.addEventListener("input", function () {
            updateTeamScore(redInputs, redScoreDisplay);
        });
    });

    // Thêm sự kiện lắng nghe khi nhập số vào input của Blue Team
    blueInputs.forEach(input => {
        input.addEventListener("input", function () {
            updateTeamScore(blueInputs, blueScoreDisplay);
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const redInputs = document.querySelectorAll("#redScore .score");
    const blueInputs = document.querySelectorAll("#blueScore .score");
    const redScoreDisplay = document.getElementById("Score-red");
    const blueScoreDisplay = document.getElementById("Score-blue");

    // Hàm reset điểm số
    function resetScores() {
        // Reset các ô input về 0
        redInputs.forEach(input => input.value = 0);
        blueInputs.forEach(input => input.value = 0);

        // Reset tổng điểm hiển thị về 0
        redScoreDisplay.textContent = 0;
        blueScoreDisplay.textContent = 0;
    }

    // Lắng nghe tổ hợp phím Ctrl + R
    document.addEventListener("keydown", function (event) {
        if (event.ctrlKey && event.key === "r") {
            event.preventDefault(); // Ngăn chặn reload trang
            document.querySelectorAll(".dot").forEach(dot => {
                dot.classList.remove("active"); // Xóa class active
            });
            resetScores(); // Gọi hàm reset
        }
    });
});




add10sBtn.addEventListener("click", function () {
    remainingTime += 10; // Thêm 10 giây
    totalTime += 10;
    disableSoundAt12 = true; // Đặt flag thành true, tức là tạm thời không cho phát âm thanh ở 12s
    updateDisplay();
});




// Kích hoạt chỉnh sửa cho phút và giây

enableEditing(secondsEl, "seconds");
enableEditing(minutesEl, "minutes");



// Gán sự kiện cho nút
startPauseBtn.addEventListener("click", startPauseTimer);
resetBtn.addEventListener("click", resetTimer);



/**
 *  
 */

// Lấy các phần tử DOM
const simpleDisplayEl = document.getElementById("simpleDisplay");
const simpleStartPauseBtn = document.getElementById("simpleStartPause");
const simpleResetBtn = document.getElementById("simpleReset");

// Biến toàn cục - đổi tên để tránh xung đột
let simpleTimeValue = 120; // Giá trị mặc định
let simpleTimerIntervalId;
let simpleIsTimerRunning = false;
let simpleEditMode = false;

// Hiển thị thời gian
function updateSimpleDisplay() {
    simpleDisplayEl.textContent = simpleTimeValue;

    // Đổi màu dựa vào thời gian còn lại
    if (simpleTimeValue <= 5) {
        simpleDisplayEl.style.color = "#FF0000"; // Đỏ
    } else if (simpleTimeValue <= 60) {
        simpleDisplayEl.style.color = "#FFA500"; // Cam
    } else {
        simpleDisplayEl.style.color = "#FFFFFF"; // Trắng
    }
}

// Bắt đầu/dừng timer
function toggleSimpleTimer() {
    if (simpleEditMode) return; // Không cho bắt đầu nếu đang edit

    if (simpleIsTimerRunning) {
        // Dừng timer
        clearInterval(simpleTimerIntervalId);
        simpleStartPauseBtn.textContent = "▶";
    } else {
        // Bắt đầu timer
        simpleTimerIntervalId = setInterval(function () {
            if (simpleTimeValue > 0) {
                simpleTimeValue--;
                updateSimpleDisplay();
            } else {
                clearInterval(simpleTimerIntervalId);
                simpleIsTimerRunning = false;
                simpleStartPauseBtn.textContent = "▶";
            }
        }, 1000);
        simpleStartPauseBtn.textContent = "⏸";
    }
    simpleIsTimerRunning = !simpleIsTimerRunning;
}

// Reset timer
function resetSimpleTimer() {
    clearInterval(simpleTimerIntervalId);
    simpleIsTimerRunning = false;
    simpleTimeValue = parseInt(simpleDisplayEl.getAttribute("data-default") || 120);
    simpleStartPauseBtn.textContent = "▶";
    updateSimpleDisplay();
}

// Xử lý click vào phần tử hiển thị thời gian
simpleDisplayEl.addEventListener("click", function () {
    if (simpleIsTimerRunning || simpleEditMode) return; // Không cho edit nếu đang chạy hoặc đang edit

    simpleEditMode = true;
    const currentValue = simpleTimeValue;

    // Lưu giá trị mặc định nếu chưa có
    if (!this.hasAttribute("data-default")) {
        this.setAttribute("data-default", currentValue);
    }

    // Tạo input
    const input = document.createElement("input");
    input.type = "number";
    input.value = currentValue;
    input.min = "1";
    input.style.width = "100px";
    input.style.fontSize = "2rem";
    input.style.textAlign = "center";
    input.style.background = "transparent";
    input.style.color = "white";
    input.style.border = "1px solid white";

    // Ẩn phần hiển thị
    this.style.display = "none";

    // Thêm input vào DOM, ngay sau phần hiển thị
    this.parentNode.insertBefore(input, this.nextSibling);
    input.focus();

    // Xử lý khi hoàn thành chỉnh sửa
    function finishEdit() {
        const newValue = parseInt(input.value);
        if (!isNaN(newValue) && newValue > 0) {
            simpleTimeValue = newValue;
        }

        // Xóa input và hiện lại phần hiển thị
        input.remove();
        simpleDisplayEl.style.display = "";
        updateSimpleDisplay();
        simpleEditMode = false;
    }

    // Xử lý sự kiện
    input.addEventListener("blur", finishEdit);
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            finishEdit();
        }
    });
});

// Thêm các sự kiện cho nút
simpleStartPauseBtn.addEventListener("click", toggleSimpleTimer);
simpleResetBtn.addEventListener("click", resetSimpleTimer);

// Khởi tạo hiển thị ban đầu
updateSimpleDisplay();






// Khởi tạo hiển thị ban đầu
updateDisplay();
