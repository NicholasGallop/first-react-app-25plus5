import './App.css';
import React from 'react';
import { FaPlay, FaPause, FaRedo, FaArrowUp, FaArrowDown, FaSlash} from 'react-icons/fa'
/*
*The only things that should be class components are things that need state(their own/not inc. parents') or lifecycle methods - everything else should be functional components
*you used to have to bind 'this' to your class methods in the constructor. if you make it an arrow function, then you don’t have to because the method will just inherit the class’s 'this'. Declare it like this:  ' stepper = () => { '     , Or don’t. Either works. 
*/
function calcMinutes(secs){ 
  let answerMinutes = 25; 
  const remainerMins = secs % (60 * 60);
  answerMinutes = ( (secs === 3600) ? 60 : Math.floor(remainerMins / 60) )
  return answerMinutes
}
function calcDisplaySeconds(secs){
  let displaySeconds = '00';
  const remainerMins = secs % (60 * 60);
  const remainerSecs = remainerMins % 60;
  const displaySecondsStringer = Math.ceil(remainerSecs).toString();
  if(displaySecondsStringer.length < 2){ displaySeconds = "0"+displaySecondsStringer; }
  else{ displaySeconds=displaySecondsStringer }
  return displaySeconds
}
const initialState= {
      minutes: 25,
      seconds: 1500,
      sessionLength: 25,
      displaySeconds: '00',
      pausey: true,
      snoozeTime: 300, 
      snoozeInput: 5, 
      snooze: false,
      isRunning: false,
    };
    // CountDowner
class App extends React.Component {
  
  state = initialState
  
  pacer = (func, time) => {
    let cancel, nextPing, timeout, wrapper
    nextPing = new Date().getTime() + time;
    timeout = null;
    wrapper = function() {
    nextPing += time;
    timeout = setTimeout(wrapper, nextPing - new Date().getTime());
    return func();
    };
    cancel = function() { return clearTimeout(timeout); };
    setTimeout(wrapper, nextPing - new Date().getTime());
    return { cancel: cancel };
  };
  stepper = () => {
    if(this.state.pausey){
      this.timer = this.pacer(this.countDown, 1000)
    }else{ this.timer.cancel() }
    this.setState((prevState) => ({
      pausey: !prevState.pausey } ))
  }
  countDown=()=> {
    if(this.state.pausey){
      this.timer.cancel();
    }else{
    this.setState((prevState)=>({
      minutes: calcMinutes(prevState.seconds-1), 
      seconds: prevState.seconds-1,
      displaySeconds: calcDisplaySeconds(prevState.seconds-1),
      isRunning: true,
    }));
    }
   if (this.state.seconds < 0) {
      this.audioBleep.play();
      if(!this.state.snooze){
        this.setState({
          snooze: true,
          seconds: this.state.snoozeTime,
          minutes: this.state.snoozeInput,
          displaySeconds: '00',
          isRunning: false
        });
      }else{
        this.setState({
          minutes: this.state.sessionLength,
          seconds: (this.state.sessionLength*60),
          displaySeconds: '00',
          snoozeTime: (this.state.snoozeInput*60),
          snooze: false,
          isRunning: true,
        });
      }  
   }
 }
 // ----------------------------------------timer settings
  plusMin=()=> {
      if(this.state.sessionLength < 60){
        this.setState((prevState)=>({
          seconds: prevState.seconds+60,
          minutes: calcMinutes(prevState.seconds+60),
          sessionLength: prevState.sessionLength+1,
        }));
      }
    }
  minusMin=()=>{
      if(this.state.sessionLength > 1){
        this.setState((prevState)=>({
          seconds: this.state.seconds-60,
          minutes: calcMinutes(this.state.seconds-60),
          sessionLength: prevState.sessionLength-1,
        }));
      }
    }
  minusSnooze = () => {
    if(this.state.snoozeInput > 1){
      this.setState((prevState)=>({
        snoozeTime: prevState.snoozeTime-60,
        snoozeInput: prevState.snoozeInput-1,
      }));
    }
   }
  plusSnooze = () => {
    if(this.state.snoozeInput < 60){
      this.setState((prevState)=>({
        snoozeTime: prevState.snoozeTime+60,
        snoozeInput: prevState.snoozeInput+1,
      }));
    }
   }
  resetter = () => {
    if(this.state.isRunning){this.timer.cancel()}
  // NEEDED CONDITIONAL 'isRunning' TO INITIATE PROPERLY FOR TESTS, SEE KEVIN DM's(FCC)
    this.setState(initialState);
    this.audioBleep.pause(); 
    this.audioBleep.currentTime = 0;
  }
//   -------------------------------------end timer settings
  render() {
   const clockBackgroundColor = this.state.snooze ? 'centrSnooze' : 'centr' 
   const referenceAudio= (audio) => {this.audioBleep = audio;}
    return(
      <div>
        <SetSnooze snoozeInput={this.state.snoozeInput} minusSnooze={this.minusSnooze} plusSnooze={this.plusSnooze} />
        <div>
          <ClockSet addMin={this.plusMin} subtractMin={this.minusMin} sessionLength={this.state.sessionLength} />
        </div>
        <div className={clockBackgroundColor} id='session-counter'>
          <DisplaySessionTime minutes={this.state.minutes} displaySeconds={this.state.displaySeconds} />
        </div>
        <StartPauseReset  shouldReset={this.resetter} initiateStepper={this.stepper} snooze={this.state.snooze} />
        <PlayAudio  referenceAudio={referenceAudio} />    {/* SO FAR CAN ONLY EVALUATE 'ref=' HERE IN PARENT*/}
      </div>
    );
  }
}
//  *******************************************************
const SetSnooze = ({snoozeInput,  minusSnooze, plusSnooze}) => {
  return (
    <div>
      <h3 id="break-label">How Many Cats?</h3>
      <div className='setters'>
        <FaArrowUp id='break-increment' className="setButsLeft" onClick={plusSnooze} />
        <div  id="break-length" className='snooze-mins'>{snoozeInput}</div>
        <FaArrowDown id='break-decrement' className="setButsRight" onClick={minusSnooze}/>
      </div>
    </div>
  );
}
const ClockSet = ({addMin, subtractMin, sessionLength}) => {     //syntax on props in FC!
//  render(){   // no render in FC
  return (
    <div>
      <h3 id='session-label'>Set Sesh</h3>
      <div className='setters'>
        <FaArrowUp id='session-increment' className='setButsLeft' onClick={addMin} />
        <div  id="session-length" className='sesh-mins' >{sessionLength}</div>
        <FaArrowDown id='session-decrement' className='setButsRight' onClick={subtractMin}/>
      </div>
    </div>
  )
}
const StartPauseReset = ({shouldReset, initiateStepper, snooze }) => {
   const mode = snooze ? 'FeedCats' : 'Drink!'
    return(
      <div>
        <div className='timer-label-box'> 
          <h1 id='timer-label' >{mode}</h1>
        </div>
        <div className='controls'>
            <button id='start_stop' className="setControlLeft" onClick={initiateStepper}>
          <FaPlay /><FaSlash/><FaPause/></button>
          <FaRedo id='reset' className='btn btn-primary fa fa-refresh' onClick={shouldReset}/>
          {/*   DOESN'T SEEM TO MATTER IF I USE <i> OR NOT   */} 
        </div>
      </div>
    )
  }

const DisplaySessionTime = ({minutes, displaySeconds}) => {
  let displayMinutes = minutes.toString()
  if(displayMinutes.length < 2){ displayMinutes = "0" + displayMinutes; }
  const displayTime = displayMinutes + ':' + displaySeconds;
  return (
    <div>
      <div id="time-left" >{displayTime}</div>
    </div>
  )
}
const PlayAudio = ({referenceAudio}) => {     // 'src' GIVEN HERE
  return (
    <audio id='beep' ref={referenceAudio} src={"https://raw.githubusercontent.com/freeCodeCamp/cdn/master/build/testable-projects-fcc/audio/BeepSound.wav"} />
  )
}
export default App;
/*
ReactDOM.render(<CounterDowner/>, document.getElementById('app'));
*/
/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
    </div>
  );
}

export default App;
*/
