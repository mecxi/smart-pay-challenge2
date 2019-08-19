
const supportedCards = {
    visa:'', mastercard:''
};

const countries = [
    {
        code: "US",
        currency: "USD",
        currencyName: '',
        country: 'United States'
    },
    {
        code: "NG",
        currency: "NGN",
        currencyName: '',
        country: 'Nigeria'
    },
    {
        code: 'KE',
        currency: 'KES',
        currencyName: '',
        country: 'Kenya'
    },
    {
        code: 'UG',
        currency: 'UGX',
        currencyName: '',
        country: 'Uganda'
    },
    {
        code: 'RW',
        currency: 'RWF',
        currencyName: '',
        country: 'Rwanda'
    },
    {
        code: 'TZ',
        currency: 'TZS',
        currencyName: '',
        country: 'Tanzania'
    },
    {
        code: 'ZA',
        currency: 'ZAR',
        currencyName: '',
        country: 'South Africa'
    },
    {
        code: 'CM',
        currency: 'XAF',
        currencyName: '',
        country: 'Cameroon'
    },
    {
        code: 'GH',
        currency: 'GHS',
        currencyName: '',
        country: 'Ghana'
    }
];

const billHype = () => {
    const billDisplay = document.querySelector('.mdc-typography--headline4');
    if (!billDisplay) return;

    billDisplay.addEventListener('click', () => {
        const billSpan = document.querySelector("[data-bill]");
        if (billSpan &&
            appState.bill &&
            appState.billFormatted &&
            appState.billFormatted === billSpan.textContent) {
            window.speechSynthesis.speak(
                new SpeechSynthesisUtterance(appState.billFormatted)
            );
        }
    });
};

const appState = {};

const formatAsMoney = (amount, buyerCountry) => {
    const matched = countries.find( c => c.country == buyerCountry);
    return matched ? amount.toLocaleString(`en-${matched.code}`, {style: 'currency', currency: matched.currency}): amount.toLocaleString('en-US', {style:'currency', currency: 'USD'});
};

const flagIfInvalid = (field, isValid) => {
    isValid ? field.classList.remove('is-invalid') :
        field.classList.add('is-invalid');
};

const expiryDateFormatIsValid = (field) => {
    const pattern = /^\d{1,2}\/\d{2}$/;
    return pattern.test(field);

    /* check for matched pattern
    if (pattern.test(field)){
        const fields = field.split('/');
        if (fields[0] < 13){
            /* check if date is in a future
            const today = new Date();
            const targetDate = new Date('20'+fields[1], (fields[0]-1));
            return targetDate.setHours(0,0,0,0) > today.setHours(0,0,0,0);
        } else return false;
    } else {
        return false;
    }*/
};

const detectCardType = (first4Digits) => {};

const validateCardExpiryDate = () => {
    const field = document.querySelector('[data-cc-info] input:nth-child(2)');
    let isValidFormat = expiryDateFormatIsValid(field.value);
    if (isValidFormat){
        const splits = field.value.split('/');
        if (splits[0] < 13){
            const currentDate = new Date();
            const userDate = new Date( `20${Number(splits[1])}`, Number(splits[0])-1);
            isValidFormat = userDate > currentDate;
        } else isValidFormat = false;
    }
    flagIfInvalid(field, isValidFormat);
    return isValidFormat;
};

const validateCardHolderName = () => {
    const cardHolderName = document.querySelector('[data-cc-info] input:nth-child(1)').value;
    let isValid = cardHolderName.length > 0 ? (cardHolderName.includes(' ') ? cardHolderName.split(' ').length < 3 : false) : false;
    if (isValid){
        cardHolderName.split(' ').forEach( name => {
            if (!name.match(/([^0-9]{3,})$/)) isValid = false;
        });
    }
    flagIfInvalid(document.querySelector('[data-cc-info] input:nth-child(1)'), isValid);
    return isValid;
};

const validateCardNumber = () => {};

const validatePayment = () => {
    validateCardNumber();
    validateCardHolderName();
    validateCardExpiryDate();
};

const smartInput = (event, fieldIndex) => {
    console.log('SmartInput event: ', event);
    console.log('SmartInput index: ', fieldIndex);
    /* define a function to add cardDigits as instructed */
    const addToCardDigits = (v, setIndex) => {
        appState.cardDigits[setIndex] == undefined ? appState.cardDigits.push(v.split()) : appState.cardDigits[setIndex].push(v);
        if (appState.cardDigits[setIndex]){
            appState.cardDigits[setIndex] = appState.cardDigits[setIndex].map((v)=> Number(v));
        }
    };

    /* initialise nav keys */
    const nav_keys = ['Backspace', 'Tab', 'Shift', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'Delete'];
    if (!nav_keys.includes(event.key)){
        /* mask digit */
       const field = event.target;
       console.log('current input ', field.value);
        setTimeout(()=>{
            //console.log('now replacing the digit : ', field.value);
            if (fieldIndex < 3 ) field.value = field.value.replace(/[^#]+/, '#');
            /* save values entered */
            addToCardDigits(event.key, fieldIndex);

            /* check if the current input field is valid for smartCursor */
            if (appState.cardDigits[fieldIndex] && !appState.cardDigits[fieldIndex].includes(NaN)){
                console.log('SmartCursor has been called');
                smartCursor(event, fieldIndex);
            }
        }, 500);
    }

    console.log('appState.cardDigits Now: ', appState.cardDigits);
};

const acceptCardNumbers = (event, fieldIndex) => {};

const smartCursor = (event, fieldIndex, fields) => {
    console.log('Current field', fieldIndex);
    console.log('Current field length', appState.cardDigits[fieldIndex].length);
    if (appState.cardDigits[fieldIndex].length == 4){
        console.log('next element in a row value by smart detection get focus');
        event.target.nextElementSibling.focus();
    }
};

const enableSmartTyping = () => {
    const inputs = document.querySelectorAll('.mdc-card__primary-action input');
    inputs.forEach( (field, index, fields) => {
        field.addEventListener('keydown', (event) =>{
            smartInput(event, index, fields);
        });
    });
};

const uiCanInteract = () => {
    document.querySelector('[data-cc-digits] input:nth-child(1)').focus();
    document.querySelector('[data-pay-btn]').addEventListener('click', validatePayment);
    billHype();
    enableSmartTyping();
};

const displayCartTotal = ({results}) => {
    const [data] = results;
    const {itemsInCart, buyerCountry} = data;
    appState.items = itemsInCart;
    appState.country = buyerCountry;
    appState.bill = itemsInCart.reduce( (sum, item) => sum + (item.price * item.qty), 0);
    appState.billFormatted = formatAsMoney(appState.bill, appState.country);
    document.querySelector('[data-bill]').textContent = appState.billFormatted;
    appState.cardDigits = [];
    uiCanInteract();
};

const fetchBill = () => {
    const apiHost = 'https://randomapi.com/api';
    const apiKey = '006b08a801d82d0c9824dcfdfdfa3b3c';
    const apiEndpoint = `${apiHost}/${apiKey}`;
    fetch(apiEndpoint)
        .then( response => {
            return response.json();
        })
        .then( (data) => {
            const {error} = data;
            if (error){
                console.log(error);
            } else {
                displayCartTotal(data);
            }
        });
};

const startApp = () => {
    fetchBill();
};

startApp();