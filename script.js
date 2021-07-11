'use strict';
// Initial state variables
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  distance;
  duration;
  coordinates;
  // All the felds which are common to both types of workouts go in the common workout class
  constructor(distance, duration, coordinates) {
    this.distance = distance;
    this.duration = duration;
    this.coordinates = coordinates;
  }
}
class Running extends Workout {
  name;
  cadence;
  pace;
  type = 'running';
  constructor(distance, duration, coordinates, cadence) {
    super(distance, duration, coordinates);
    this.cadence = cadence;
    this.pace = this.duration / this.distance;
  }
}
class Cycling extends Workout {
  name;
  elevationGain;
  speed;
  type = 'cycling';
  constructor(distance, duration, coordinates, elevationGain) {
    super(distance, duration, coordinates);
    this.elevationGain = elevationGain;
    this.speed = this.distance / (this.duration / 60);
  }
}
class App {
  #map;
  #mapEvent;
  workoutsArray = [];
  // Current object (either running or cycling) being created
  tempObject;
  constructor() {
    this._loadDataFromStorage();
    // Display the map upon startup
    this._getPosition();
    // Whenever the user changes type of workout
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    //  Event handler for when form is submitted
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Event delegation
    // whenever function is called in an eventlistener the this keyword is set to the element on which it listens
    containerWorkouts.addEventListener('click', this._moveMap.bind(this));
  }
  // Code for creating markers on the map
  _createMarker(objectToBeMarked) {
    // Date variable created to offset some wierd error and bug when parsing back from JSON
    let date = new Date(objectToBeMarked.date);
    L.marker(objectToBeMarked.coordinates)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${objectToBeMarked.type}-popup`,
        })
      )
      .setPopupContent(
        `${objectToBeMarked.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
          objectToBeMarked.type[0].toUpperCase() +
          objectToBeMarked.type.slice(1)
        } on ${months[date.getMonth()]} ${date.getDate()}`
      )
      .openPopup();
  }
  _block() {
    alert('Please allow location access and try again :(');
  }
  _getPosition() {
    // Using the geolocation API
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      this._block.bind(this)
    );
  }
  _loadMap(position) {
    /*
  // No requirement code
  // Generating a google map link for my position
  console.log(`https://www.google.co.in/maps/@${latitude},${longitude}`);
  console.log(latitude, longitude);
  console.log(mapEvent.latlng);
  */
    // Position is a big object which has a coords child object with current latitude and longitude data
    // destructuring
    let { latitude, longitude } = position.coords;
    // We need an array of coordinate for leaflet to work so creating it
    let coordinates = [latitude, longitude];
    // Leaflet code from website adapted for our use
    this.#map = L.map('map').setView(coordinates, 17);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // Using a built in function of the leaflet library to listen for click event on the map
    this.#map.on('click', this._showForm.bind(this));
    this.workoutsArray.forEach(workout => {
      this._createMarker(workout);
    });
  }
  _showForm(mapEvent) {
    this.#mapEvent = mapEvent;
    // Callback for when map is clicked
    // Display form when map is clicked
    form.classList.remove('hidden');
    // Put the blinking cursor in the first field for improved user experience
    inputDistance.focus();
  }
  // Callback for typeChange listener
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _displayWorkout(objectToDisplay) {
    // Date variable created to offset some wierd error and bug when parsing back from JSON
    let date = new Date(objectToDisplay.date);
    // Creating the list item
    let htmlToAdd = `<li class="workout workout--${
      objectToDisplay.type
    }" data-id="${objectToDisplay.id}">
    <h2 class="workout__title">${
      objectToDisplay.type[0].toUpperCase() + objectToDisplay.type.slice(1)
    } on ${months[date.getMonth()]} ${date.getDate()} </h2>
    <div class="workout__details">
      <span class="workout__icon">${
        objectToDisplay.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${objectToDisplay.distance}</span>
      <span class="workout__unit">km</span>
    </div><div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${
      objectToDisplay.duration
    }</span>                                                      
    <span class="workout__unit">min</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${
      objectToDisplay.type === 'running'
        ? objectToDisplay.pace.toFixed(1)
        : objectToDisplay.speed.toFixed(1)
    }</span>
    <span class="workout__unit">${
      objectToDisplay.type === 'running' ? 'min / km' : 'km / h'
    }</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">${
      objectToDisplay.type === 'running' ? '🦶🏼' : '⛰'
    }</span>
    <span class="workout__value">${
      objectToDisplay.type === 'running'
        ? objectToDisplay.cadence
        : objectToDisplay.elevationGain
    }</span>
    <span class="workout__unit">${
      objectToDisplay.type === 'running' ? 'spm' : 'm'
    }</span>
  </div>
</li>`;
    form.insertAdjacentHTML('afterend', htmlToAdd);
  }
  // Callback for when the form is submitted
  _newWorkout(formEvent) {
    // Prevent page from reloading upon form submission
    formEvent.preventDefault();
    if (form.classList.contains('hidden') == true) return;
    // Getting data from the form
    // Adding a '+' before a string converts it into a Number
    // workoutType is used to decide wether to take the Cadence or ElevationGain from the form
    // In the HTMl Type field of the form had an attribute called value which is either Running or Cycling
    let workoutType = inputType.value;
    let distance = inputDistance.value;
    let duration = inputDuration.value;
    let cadence;
    let elevationGain;
    // Latlng is an object which stores the latitude and longitude clicked
    let { lat, lng } = this.#mapEvent.latlng;
    let coordinatesOnClick = [lat, lng];
    // Validating the data
    function dataValidator() {
      // Ternary operator to assign variable based on type
      workoutType === 'running'
        ? (cadence = inputCadence.value)
        : (elevationGain = inputElevation.value);
      // Guard clause for data validation
      if (
        cadence === '' ||
        elevationGain == '' ||
        distance === '' ||
        duration === '' ||
        !+distance ||
        !+duration ||
        (!+cadence && !+elevationGain) ||
        +distance < 0 ||
        +duration < 0 ||
        +cadence < 0
      ) {
        return 0;
      } else {
        distance = +inputDistance.value;
        duration = +inputDuration.value;
        cadence = +inputCadence.value;
        elevationGain = +inputElevation.value;
        return 1;
      }
    }
    let decision = dataValidator();
    if (decision === 0) {
      return alert('please enter a valid input');
    }
    // Creating respective objects
    function objectCreator(workoutType) {
      if (workoutType === 'running') {
        let runningObject = new Running(
          distance,
          duration,
          coordinatesOnClick,
          cadence
        );
        this.tempObject = Object.assign({}, runningObject);
        this.workoutsArray.push(runningObject);
      } else {
        let cyclingObject = new Cycling(
          distance,
          duration,
          coordinatesOnClick,
          elevationGain
        );
        this.tempObject = Object.assign({}, cyclingObject);
        this.workoutsArray.push(cyclingObject);
      }
    }
    objectCreator.call(this, workoutType);
    this._createMarker(this.tempObject);
    this._displayWorkout(this.tempObject);
    // Reset form fields to empty and hide the form
    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value =
      '';
    form.classList.add('hidden');
    // Add the data in the workoutsarray to local storage
    localStorage.setItem('workoutsArray', JSON.stringify(this.workoutsArray));
  }
  _moveMap(event) {
    let selectedWorkoutElement = event.target.closest('.workout');
    // Guard clause because if the user doesnt click on the box for the event then the event.target becomes null
    if (selectedWorkoutElement === null) return;
    let selectedWorkoutObject = this.workoutsArray.find(
      workoutObject => workoutObject.id === selectedWorkoutElement.dataset.id
    );
    this.#map.setView(selectedWorkoutObject.coordinates, 17, {
      animate: true,
      pan: { duration: 1 },
    });
  }
  _loadDataFromStorage() {
    // Load data from local storage upon reload of page
    let dataFromStorageArray = JSON.parse(
      localStorage.getItem('workoutsArray')
    );
    if (dataFromStorageArray === null) return;
    this.workoutsArray = dataFromStorageArray;
    this.workoutsArray.forEach(workout => {
      this._displayWorkout(workout);
    });
    // Since the data is loaded from the storage atthe beginning, we cannot display the markers here as the map is not rendered yet so map object is not defined.
    // so we render the markers in the _loadmap() function
  }
  reset() {
    localStorage.clear();
    location.reload();
  }
}
let pageLoader = new App();
