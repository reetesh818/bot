import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;


//to show loading .... before the ai gives it results
function loader(element){
  console.log(element);
  element.textContent="";
  loadInterval=setInterval(()=>{
    element.textContent +='.';

    if(element.textContent === '....'){
      element.textContent='';
    }
  },300);
}


//to display the result in a typing format (i.e. not displaying the whole result all at once, instead printing character by character)
function typeText(element,text){
  let index = 0;

  let interval = setInterval(() => {
    if(index < text.length){
      element.innerHTML += text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  },20)
}

//function to generate a random Id
function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexaDecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexaDecimalString}`;
}

function chatStripe(isAi,value,uniqueId) {
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
          src="${isAi ? bot : user}"
          alt="${isAi ? 'bot' : 'user'}" />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  )
}

const handleSubmit = async(e) => {
  e.preventDefault();
  
  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false,data.get('prompt'));
  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true," ",uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;
  console.log(uniqueId);
  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);


  //fetch data from server -> bot's response

  const response = await fetch('https://bot-vm9i.onrender.com',{
    method:"POST",
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      prompt:data.get('prompt')
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML='';

  if(response.ok){
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv,parsedData);
  }else{
    const err = await response.text;
    messageDiv.innerHTML = "Something went wrong!";

    alert(err);
  }
}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup',(e) => {
  if(e.keyCode===13){
    handleSubmit(e);
  }
})