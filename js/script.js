/** @constant {string} 
    @author xem
    @see {@link https://gist.github.com/xem/670dec8e70815842eb95}
*/
const audioURI =
  "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU" +
  "FreeCodeCamp".repeat(1e3);
/**
 * AccurateInterval() is a dop in replacement for setInterval() that does not drift over long periods of time.
 * @param {setTimeout} fn - Timeout callback
 * @param {?number} time - Time in ms
 * @return {clearTimeout} - Function cancel, it clears the interval
 * @author Alex J. Wayne.
 */
const accurateInterval = (fn, time = 1000) => {
  let cancel, nextAt, timeout, wrapper;
  nextAt = new Date().getTime() + time;
  timeout = null;
  wrapper = function () {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function () {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel
  };
};

// Controls to change the length number of Break or Session
function Length({ type, title, onClick, length }) {
  return (
    <div className="control-length">
      <h3 id={type + "-label"}>{title}</h3>
      <button
        className="btn"
        id={type + "-decrement"}
        onClick={onClick}
        value="-1"
      >
        &#x25C0;
      </button>
      <span className="time-length" id={type + "-length"}>
        {length}
      </span>
      <button
        className="btn"
        id={type + "-increment"}
        onClick={onClick}
        value="+1"
      >
        &#x25B6;
      </button>
    </div>
  );
}

// Main App
function App() {
  const [displayTimer, setDisplayTimer] = React.useState(1500);
  const [breakLength, setBreakLength] = React.useState(5);
  const [sessionLength, setSessionLength] = React.useState(25);
  const [isTimerOn, setIsTimerOn] = React.useState(false);
  const [timerName, setTimerName] = React.useState("Session");
  const [intervalId, setIntervalId] = React.useState("");
  const [breakAudio, setBreakAudio] = React.useState("");

  const lengthControl = (stateToChange, value, currentLength, timerType) => {
    if (isTimerOn) return;
    const numValue = parseInt(value);
    if (
      (currentLength > 1 || numValue > 0) &&
      (currentLength < 60 || numValue < 0)
    ) {
      stateToChange((prev) => prev + numValue);
      if (timerName !== timerType) {
        setDisplayTimer((prev) => currentLength * 60 + 60 * numValue);
      }
    }
  };

  const controlBreakLength = (el) => {
    lengthControl(
      setBreakLength,
      el.currentTarget.value,
      breakLength,
      "Session"
    );
  };
  const controlSessionLength = (el) => {
    lengthControl(
      setSessionLength,
      el.currentTarget.value,
      sessionLength,
      "Break"
    );
  };
  phaseControl = () => {
    if (displayTimer === 0) {
      breakAudio.play();
    }
    if (displayTimer < 0) {
      if (intervalId) {
        intervalId.cancel();
      }
      if (timerName === "Session") {
        switchTimer(breakLength * 60, "Break");
        startClock();
      } else {
        switchTimer(sessionLength * 60, "Session");
        startClock();
      }
    }
  };
  function startClock() {
    setIntervalId((prev) => {
      return accurateInterval(() => {
        setDisplayTimer((prev) => prev - 1);
        phaseControl();
      });
    });
  }
  const timerControl = () => {
    if (!isTimerOn) {
      startClock();
      setIsTimerOn((prev) => true);
    } else {
      setIsTimerOn((prev) => false);
      if (intervalId !== "") {
        intervalId.cancel();
      }
    }
  };
  const switchTimer = (num, str) => {
    setDisplayTimer((prev) => num);
    setTimerName((prev) => str);
  };
  const formatTime = (time) => {
    let min = Math.floor(time / 60);
    let sec = time - min * 60;
    sec = sec < 10 ? "0" + sec : sec;
    min = min < 10 ? "0" + min : min;
    return min + ":" + sec;
  };
  const reset = () => {
    setBreakLength((prev) => 5);
    setSessionLength((prev) => 25);
    setIsTimerOn((prev) => false);
    setDisplayTimer((prev) => 1500);
    setTimerName((prev) => "Session");
    setIntervalId((prev) => "");
    if (intervalId !== "") {
      intervalId.cancel();
    }
    breakAudio.pause();
    breakAudio.currentTime = 0;
  };
  return (
    <div className="app">
      <h1 className="app-title">25 + 5 Pomodoro clock</h1>
      <div className="clock">
        <div className="timer-wrapper">
          <h2 id="timer-label">{timerName}</h2>
          <h2 className="timer" id="time-left">
            {formatTime(displayTimer)}
          </h2>
        </div>
        <div className="timer-controls">
          <button
            className="btn btn-left"
            id="start_stop"
            onClick={timerControl}
          >
            {isTimerOn ? "Pause" : "Start"}
          </button>
          <button className="btn btn-right" id="reset" onClick={reset}>
            Reset
          </button>
        </div>
      </div>
      <div className="controls">
        <Length
          type="break"
          length={breakLength}
          onClick={controlBreakLength}
          title="Break Length"
        />
        <Length
          type="session"
          length={sessionLength}
          onClick={controlSessionLength}
          title="Session Length"
        />
      </div>
      <audio
        id="beep"
        preload="auto"
        ref={(audio) => setBreakAudio((prev) => audio)}
        src={audioURI}
      />
    </div>
  );
}
ReactDOM.render(<App />, document.getElementById("wrapper"));
