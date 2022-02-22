const generateButton = document.getElementById('generate');
const inputBox = document.getElementById('zip');
const feelingsBox = document.getElementById('feelings');
const errorMessage = document.getElementById('error');

//helper function that generates the full URL.
function generateRequesrUrl(zipCode){
  const apiKey = ' '; //add the API key you get from https://openweathermap.org/ here.
  return `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&appid=${apiKey}&units=metric`;
}

function showErrorMessage(message){
  errorMessage.innerHTML = message;
  //hide message after 2 sec.
  setTimeout(()=> errorMessage.innerHTML = '', 2000);
}

const getWeatherData = async (requestURL)=>{
      const response = await fetch (requestURL);
      if (response.status !== 200){
        throw Error('Sorry! City not found.')
      }else{
        const jsonResponse = await response.json();
        return jsonResponse;
      }
};

const postWeatherData = async ( url = '', data = {})=>{
  const response = await fetch(url, {
    method: 'POST', 
    credentials: 'same-origin',
    headers: {
        'Content-Type': 'application/json',
    },
   // Body data type must match "Content-Type" header        
    body: JSON.stringify(data), 
  });
  try {
    const jsonResponse = await response.json();
    return jsonResponse;
  }catch(error) {
    showErrorMessage('Oops! Something went wrong.');
  }
}

//event listeners
generateButton.addEventListener('click', ()=>{
  if (inputBox.value.trim() !=''){
    const zipCode = inputBox.value.trim();  //removing any extra white spaces that user may add accidentally.
    getWeatherData(generateRequesrUrl(zipCode))
    .then((data)=>{
      //from the API documentation we know that the date is stored in dt, temprature is stored in main.temp.
      //converting the Unix timestamp to a readable date string.
      let dt = new Date(data.dt * 1000);
      let newDate = dt.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
      //returning an object that contains the data.
      return {date: newDate,
        temprature: data.main.temp,
        city: data.name,
        country: data.sys.country,
        feelings: feelingsBox.value};
    })
    .then((data)=> {postWeatherData ('/postWeatherData', data)}) // posting the data to the server.
    .then(()=> {updateUI();})
    .catch((error)=> {showErrorMessage(error.message);}); //catching any potential errors.
  }
  else{
  //if the input box is empty or null an error message should appear to notify the user.
  showErrorMessage('Please enter a valid US zip code.');
  }
});
// the updateUI async function works as a function that retrieves the app's data from server and updates the ui as well.
const updateUI = async ()=>{
  const response = await fetch('/getWeatherData');
  try{
    const jsonResponse = await response.json();
    document.getElementById('city').innerHTML = `${jsonResponse.city}, ${jsonResponse.country}`;
    document.getElementById('temp').innerHTML = `${Math.round(jsonResponse.temprature)}°C`;
    document.getElementById('date').innerHTML = jsonResponse.date;
    document.getElementById('content').innerHTML = jsonResponse.feelings;
  }catch(error){
    showErrorMessage('Oops! Something went wrong.');
  }
};
