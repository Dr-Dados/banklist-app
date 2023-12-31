'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const fullDate = date => {
  const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();
  const hour = `${date.getHours()}`.padStart(2, 0);
  const minutes = `${date.getMinutes()}`.padStart(2, 0);
  return `${day}/${month}/${year}, ${hour}:${minutes}`;
};
const displayMovements = function (account, sort = false) {
  containerMovements.innerHTML = '';
  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;
  movs.forEach(function (mov, key) {
    const date = new Date(account.movementsDates[key]);
    const updatedMov = new Intl.NumberFormat(account.locale).format(mov);
    const displayDate = fullDate(date);
    let type = mov < 0 ? 'withdrawal' : 'deposit';
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      key + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${updatedMov}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
let currentUser;

/////////////////////////////////////////////////

// Creating usernames for every account
const createUserNames = accs => {
  accs.forEach(acc => {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(el => el[0])
      .join('');
  });
};

const calcDisplayBalance = acc => {
  acc.balance = new Intl.NumberFormat(acc.locale).format(
    acc.movements.reduce((acc, cur) => acc + cur, 0)
  );
  labelBalance.textContent = `${acc.balance}€`;
};
const updateUI = account => {
  // Experimenting with the API

  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  labelDate.textContent = new Intl.DateTimeFormat(
    account.locale,
    options
  ).format(now);

  // labelDate.textContent = fullDate(now);
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
};

const startLogOutTimer = () => {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const seconds = String(time % 60).padStart(2, 0);
    //in each call ,print the remaining time to the user interface
    labelTimer.textContent = `${min}:${seconds}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Login to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  //Set time to 5 minutes
  let time = 300;
  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  //when 0 seconds log out
};
const calcDisplaySummary = acc => {
  const totalDepositUSD = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, cur) => acc + cur, 0);
  const totalWithdrawal = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, cur) => acc + cur, 0);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(el => (el * acc.interestRate) / 100)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumIn.textContent = `${totalDepositUSD}€`;
  labelSumOut.textContent = `${Math.abs(totalWithdrawal)}€`;
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};
createUserNames(accounts);

btnLogin.addEventListener('click', e => {
  e.preventDefault();
  const account = accounts.find(
    account =>
      account.pin === parseInt(inputLoginPin.value) &&
      account.userName === inputLoginUsername.value.toLowerCase()
  );
  if (account) {
    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();
    labelWelcome.textContent = `Welcome back ${account.owner.split(' ')[0]}`;
    containerApp.style.opacity = 1;
    updateUI(account);
    currentUser = account;
    startLogOutTimer();
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    el => el.userName === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  if (
    amount > 0 &&
    amount <= currentUser.balance &&
    receiverAcc.userName !== currentUser.userName
  ) {
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date());
    currentUser.movements.push(-1 * amount);
    currentUser.movementsDates.push(new Date());
    updateUI(currentUser);
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const amount = +inputLoanAmount.value;
  if (amount > 0 && currentUser.movements.some(el => el >= amount * 0.1)) {
    setTimeout(function () {
      currentUser.movements.push(amount);
      currentUser.movementsDates.push(new Date());
      updateUI(currentUser);
    }, 3000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentUser.userName &&
    +inputClosePin.value === currentUser.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === currentUser.userName
    );
    //Hide UI
    containerApp.style.opacity = 0;

    // Delete Account
    accounts.splice(index, 1);
  }
});
let sorted = false;
btnSort.addEventListener('click', e => {
  e.preventDefault();
  sorted = !sorted;
  displayMovements(currentUser, sorted);
});

/// Lectures

// const ingredients = ['olives', 'spinach'];

// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`here is your pizza with ${ing1}, ${ing2}`),
//   3000,
//   ...ingredients
// );
// setInterval(console.log('Test'), 1000);

// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//setTimeout
