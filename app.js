// console.log("account start");

let userAccountsDetails;
const forminputContainer = document.getElementById('form-inputs');
const loader = document.querySelector('.loader');

function toggleLoader () {
  loader.classList.toggle('hidden');
}

const myHeaders = new Headers();
myHeaders.append(
  "Authorization",
  "Token 9eefc6f27f679075e33fc74de892a879671a659a357e0b29788085886f3a1af4"
);
var requestOptions = {
  method: "GET",
  headers: myHeaders,
  redirect: "follow",
};

const biz_account_id = 577;
const baseURL = "https://stage.getprospa.com/api/v1/";
const getSubAccountsEndpoint = "account/holder_sub_wallets/";

function getSubAccounts() {
  loader.classList.remove('hidden');
  fetch(baseURL + getSubAccountsEndpoint + biz_account_id, requestOptions)
    .then((res) => res.json())
    .then((data) => {
      userAccountsDetails = data;
      setUserMessage();
      processUserAccountForm();
      loader.classList.add('hidden');
    })
    .catch((error) => {
      console.log("error", error);
      loader.classList.add('hidden');
    });
}

getSubAccounts();

function setUserMessage() {
  const { message } = userAccountsDetails;
  let userHeader =  document.getElementById('user');
  userHeader.innerHTML = message;
};

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
  }
}

function processUserAccountForm() {
  removeAllChildNodes(forminputContainer);
  const { data } = userAccountsDetails;
  let defaultValueOfCurrentAccount  = 0;

  data.map((accountDetail, index) => {
    inputFieldCreator(accountDetail);
    defaultValueOfCurrentAccount += Number(accountDetail.incoming_allocation);
  });


  if (defaultValueOfCurrentAccount === 0) {
    const currentInput = document.querySelector('[account-type="current"]');
    currentInput.setAttribute('value', 100);
  }
}


function inputFieldCreator(accountDetail) {
  const { biz_wallet_id, biz_wallet_type, incoming_allocation } = accountDetail;

  let formGroup = document.createElement('div');
  let span = document.createElement('span');
  let input = document.createElement('input');

  span.innerHTML = biz_wallet_id + ' ' + biz_wallet_type;
  formGroup.appendChild(span);

  input.setAttribute('type', 'number');
  input.setAttribute('name', biz_wallet_id + biz_wallet_type);
  input.setAttribute('id', biz_wallet_id);
  input.setAttribute('value', Number(incoming_allocation));
  input.setAttribute('account-Type', biz_wallet_type);
  input.setAttribute('min', 0);
  
  if (biz_wallet_type === 'current') {
    input.setAttribute('readonly', true);

  }

  formGroup.appendChild(input);

  forminputContainer.appendChild(formGroup);


}

//  form handlers
function handleFormChange(event) {
  toggleLoader();
  const currentInput = document.querySelector('[account-type="current"]');
  let otherAllocations = 0;

  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    if (input.attributes.getNamedItem('account-type').value !== 'current') {
      otherAllocations += Number(input.value);
    }
  });

  if (otherAllocations > 100) {
    getSubAccounts();
    alert('allocations cannot be exceed 100%');
    return;
  }

  const newCurrentValue = 100 - otherAllocations;
  currentInput.setAttribute('value', newCurrentValue);
  toggleLoader();
}

function handleSubmitForm(event) {
  toggleLoader();
  event.preventDefault();

  const formdata = new FormData();
  formdata.append("biz_account_id", biz_account_id);

  const inputs = document.querySelectorAll('input');
  let postData = [];
  inputs.forEach(input => {
    postData.push({
      walletID: input.attributes.getNamedItem('id').value,
      walletShare: input.value,
    })
  });
  formdata.append("wallet_allocation", JSON.stringify(postData));

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  };

  console.log(formdata);

  fetch("https://stage.getprospa.com/api/v1/account/stake_share_add/", requestOptions)
    .then(response => response.json())
    .then(result => {
      if (result.message) alert(result.message);
      console.log(result);
      toggleLoader();
    })
    .catch(error => {
      console.log('error', error);
      toggleLoader();
    });

}

function handleReset(event) {

  var formdata = new FormData();
  formdata.append("biz_account_id", biz_account_id);

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formdata,
    redirect: 'follow'
  };

  fetch("https://stage.getprospa.com/api/v1/account/readjust_wallet_share/", requestOptions)
    .then(response => response.text())
    .then(result => {
      console.log(result);
      getSubAccounts();
    })
    .catch(error => console.log('error', error));
}

