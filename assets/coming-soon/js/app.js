
window.addEventListener('load', () => {

  const soon = document.querySelector('.soon');
  const title = document.querySelector('.title');
  const description = document.querySelector('.description');
  const subscribe = document.querySelector('.subscribe');
  const phone = document.querySelector('.phone');
  const features = document.querySelectorAll('.feature');
  const copyright = document.querySelector('.copyright');
  const navigation = document.querySelector('.navigation');
  const social = document.querySelector('.social');
  const logo = document.querySelector('.logo');
  const form = document.querySelector('.js-form');
  const button = document.querySelector('.form__submit');
  const infoBlock = document.querySelector('.form__info');

  soon.classList.remove('soon_active');
  title.classList.remove('title_active');
  description.classList.remove('description_active');
  subscribe.classList.remove('subscribe_active');
  phone.classList.remove('phone_active');
  [].slice.call(features).forEach(item => {
    item.classList.remove('feature_active');
  });
  copyright.classList.remove('copyright_active');
  navigation.classList.remove('navigation_active');
  social.classList.remove('social_active');
  logo.classList.remove('logo_active');
  // serialize form inputs
  const serialize = ({ elements }) => {

    // Setup our serialized data
    let serialized = [];

    // Loop through each field in the form
    for (let i = 0; i < elements.length; i++) {

      let field = elements[i];

      // Don't serialize fields without a name, submits, buttons, file and reset inputs, and disabled fields
      if (!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;


      // Convert field data to a query string
      if ((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
        serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
      }
    }

    return serialized.join('&');

  };

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    console.log(serialize(form), 'ser');

    button.classList.add('state-show-spinner');

    fetch(`${form.action}&${serialize(form)}`, {
      method: form.method,
      mode: 'no-cors',
      body: '',
      headers: {
        'Content-Type': "application/json; charset=utf-8"
      }
    })
        .then(function(res) {
          console.log(res, 'first then');
          infoBlock.classList.add('form__info_success');
          infoBlock.classList.remove('form__info_error');
          infoBlock.classList.remove('form__info_hide');
          button.classList.remove('state-show-spinner');
          setTimeout(function() {
            infoBlock.classList.add('form__info_hide');
          }, 5000);
        })
        .then(function(res) {
          console.log(res, 'second then')
        })
        .catch(function(err) {
          console.log(err);
          infoBlock.innerText = 'Could not connect to the registration server. Please try again later.';
          infoBlock.classList.add('form__info_error');
          infoBlock.classList.remove('form__info_success');
          infoBlock.classList.remove('form__info_hide');
          setTimeout(function() {
            infoBlock.classList.add('form__info_hide');
          }, 5000)
        })
  })
});
