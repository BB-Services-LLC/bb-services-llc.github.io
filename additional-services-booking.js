
/* BB SERVICES — Junk Removal, Garage, Lawn & Property Care, and Snow Removal Booking */
(function () {
'use strict';

const GARAGE = 'garage-cleaning';
const JUNK = 'trash-junk-removal';

const SNOW = {
  walkway: 'Walkway Snow Removal',
  driveway: 'Driveway Snow Removal',
  'around-house': 'Around-the-House Snow Removal'
};

const names = {
  [GARAGE]: 'Garage Cleaning',
  [JUNK]: 'Junk Removal',
  ...SNOW
};

const garageRates = {
  single: 125,
  double: 195,
  large: 275
};

const junkRates = {
  single: 150,
  small: 175,
  quarter: 295,
  half: 475,
  threequarter: 695,
  full: 895
};

const lawnServices = [
  ['lawn-mowing', 'Lawn Mowing',
    'Routine mowing to keep your grass neat, manageable, and well maintained.'],
  ['weed-removal', 'Weed Removal',
    'Removal of weeds from suitable lawn and landscape areas.'],
  ['mulch-installation', 'Mulch Installation',
    'Installation and spreading of mulch in existing landscape beds.'],
  ['decorative-rock', 'Decorative Rock Installation',
    'Installation and spreading of decorative landscape rock.'],
  ['yard-cleanup', 'Yard Cleanup',
    'General cleanup of leaves, debris, and manageable yard waste.'],
  ['trimming-edging', 'Trimming & Edging',
    'Basic trimming and edging around accessible lawn areas.'],
  ['seasonal-yard-cleanup', 'Seasonal Yard Cleanup',
    'Larger seasonal cleanup of suitable lawn and property areas.'],
  ['property-maintenance', 'Property Maintenance',
    'Routine lawn and property-care service for suitable areas.']
];

const lawnNames = Object.fromEntries(
  lawnServices.map(service => [service[0], service[1]])
);

const $ = id => document.getElementById(id);
const v = id => String($(id)?.value || '').trim();

function addOption() {
  const select = $('service');
  if (!select) return;

  [
    [GARAGE, 'Garage Cleaning'],
    [JUNK, 'Junk Removal'],
    ...lawnServices.map(x => [x[0], x[1]]),
    ...Object.entries(SNOW)
  ].forEach(([value, label]) => {
    if (![...select.options].some(o => o.value === value)) {
      select.add(new Option(label, value));
    }
  });
}

function addCategory() {
  if (!$('automotive') || $('additional-booking-services')) return;

  const section = document.createElement('section');
  section.className = 'category';
  section.id = 'additional-booking-services';

  section.innerHTML = `
    <div class="category-head">
      <h2>Garage Cleaning &amp; Junk Removal</h2>
      <p>Residential garage cleaning and volume-based junk removal.</p>
    </div>
    <div class="services">
      <div class="service">
        <strong>Garage Cleaning</strong>
        <span>Garage cleaning and cleanout with estimates based on garage size.</span>
        <button type="button" data-add="garage-cleaning">Book Online</button>
      </div>
      <div class="service">
        <strong>Furniture Removal</strong>
        <span>Removal of approved couches, chairs, tables, dressers, and other household furniture.</span>
        <button type="button" data-add="trash-junk-removal" data-junk-type="Furniture and household items">Book Online</button>
      </div>
      <div class="service">
        <strong>Appliance Removal</strong>
        <span>Removal of standard household appliances. Refrigerators and specialty appliances require a custom quote.</span>
        <button type="button" data-add="trash-junk-removal" data-junk-type="Appliances">Book Online</button>
      </div>
      <div class="service">
        <strong>Household Junk &amp; Clutter</strong>
        <span>Boxes, bags, and general household items you no longer need.</span>
        <button type="button" data-add="trash-junk-removal" data-junk-type="Boxes, bags, and general clutter">Book Online</button>
      </div>
      <div class="service">
        <strong>Garage, Basement &amp; Attic Cleanouts</strong>
        <span>Clear out approved household items from garages, basements, attics, and storage areas.</span>
        <button type="button" data-add="trash-junk-removal" data-junk-type="Garage, basement, or attic cleanout">Book Online</button>
      </div>
      <div class="service">
        <strong>Yard Debris Removal</strong>
        <span>Removal of approved branches, bagged leaves, and ordinary outdoor debris.</span>
        <button type="button" data-add="trash-junk-removal" data-junk-type="Yard debris">Book Online</button>
      </div>
      <div class="service">
        <strong>Mixed Junk Removal</strong>
        <span>Removal of mixed, non-hazardous household items based on truck space used.</span>
        <button type="button" data-add="trash-junk-removal" data-junk-type="Mixed household junk">Book Online</button>
      </div>
      <div class="service">
        <strong>Construction &amp; Heavy Debris</strong>
        <span>Concrete, dirt, tile, renovation debris, and heavy materials require an individual quote.</span>
        <button type="button" data-add="trash-junk-removal" data-junk-type="Construction debris or heavy materials — custom quote">Request Quote</button>
      </div>
      <div class="service">
        <strong>Specialty Item Removal</strong>
        <span>Mattresses, tires, electronics, refrigerators, and other items with special handling or disposal requirements require a custom quote.</span>
        <button type="button" data-add="trash-junk-removal" data-junk-type="Specialty or other items — custom quote">Request Quote</button>
      </div>
    </div>
  `;

  $('automotive').insertAdjacentElement('afterend', section);

  section.querySelector('.category-head')
    .addEventListener('click', () => section.classList.toggle('open'));

  section.querySelectorAll('[data-add]').forEach(button => {
    button.addEventListener('click', () => {
      openAdd(button.dataset.add);
      if (button.dataset.junkType && $('junkType')) {
        $('junkType').value = button.dataset.junkType;
      }
    });
  });
}

function addLawnCategory() {
  if (!$('automotive') || $('lawn-property-booking-services')) return;

  const anchor = $('additional-booking-services') || $('automotive');
  const section = document.createElement('section');

  section.className = 'category';
  section.id = 'lawn-property-booking-services';

  section.innerHTML = `
    <div class="category-head">
      <h2>Lawn &amp; Property Care</h2>
      <p>Mobile lawn and property care services available for online booking.</p>
    </div>
    <div class="services">
      ${lawnServices.map(service => `
        <div class="service">
          <strong>${service[1]}</strong>
          <span>${service[2]}</span>
          <button type="button" data-lawn="${service[0]}">Book Online</button>
        </div>
      `).join('')}
    </div>
  `;

  anchor.insertAdjacentElement('afterend', section);

  section.querySelector('.category-head')
    .addEventListener('click', () => section.classList.toggle('open'));

  section.querySelectorAll('[data-lawn]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openLawn(button.dataset.lawn);
    }, true);
  });
}

function addSnowCategory() {
  if (!$('automotive') || $('snow-removal-booking-services')) return;

  const anchor =
    $('lawn-property-booking-services') ||
    $('additional-booking-services') ||
    $('automotive');

  const section = document.createElement('section');
  section.className = 'category';
  section.id = 'snow-removal-booking-services';

  section.innerHTML = `
    <div class="category-head">
      <h2>Residential Snow Removal</h2>
      <p>Choose the residential snow removal areas you need.
      Pricing will be quoted based on snowfall accumulation,
      selected areas, and property conditions.</p>
    </div>
    <div class="services">
      <div class="service">
        <strong>Walkway Clearing</strong>
        <span>Residential walkway snow clearing.</span>
        <button type="button" data-snow="walkway">Book Online</button>
      </div>
      <div class="service">
        <strong>Driveway Clearing</strong>
        <span>Residential driveway snow clearing.</span>
        <button type="button" data-snow="driveway">Book Online</button>
      </div>
      <div class="service">
        <strong>Around-the-House Clearing</strong>
        <span>Residential snow clearing around the house.</span>
        <button type="button" data-snow="around-house">Book Online</button>
      </div>
    </div>
  `;

  anchor.insertAdjacentElement('afterend', section);

  section.querySelector('.category-head')
    .addEventListener('click', () => section.classList.toggle('open'));

  section.querySelectorAll('[data-snow]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openSnow(button.dataset.snow);
    }, true);
  });
}

function fields() {
  const grid = document.querySelector('#booking .grid');
  const date = $('date')?.parentElement;

  if (!grid || !date) return;

  const fieldDefinitions = [
    [
      'garageSizeField',
      'Garage Size',
      `<option value="">Select garage size</option>
       <option value="single">1-car garage — $125</option>
       <option value="double">2-car garage — $195</option>
       <option value="large">3+ car / large garage — $275</option>`,
      'garageSize'
    ],
    [
      'junkLoadField',
      'Estimated Junk Load Size',
      `<option value="">Select estimated load</option>
       <option value="single">Single bulky item / minimum pickup — $150</option>
       <option value="small">Small load / up to 1/8 truck — $175</option>
       <option value="quarter">1/4 truck — $295</option>
       <option value="half">1/2 truck — $475</option>
       <option value="threequarter">3/4 truck — $695</option>
       <option value="full">Full truck — $895</option>`,
      'junkLoad'
    ]
  ];

  fieldDefinitions.forEach(([id, label, options, selectId]) => {
    if ($(id)) return;

    const div = document.createElement('div');
    div.className = 'field full hidden additional-field';
    div.id = id;

    div.innerHTML = `
      <label for="${selectId}">
        ${label} <span class="required">*</span>
      </label>
      <select id="${selectId}">${options}</select>
    `;

    grid.insertBefore(div, date);
  });

  if (!$('junkTypeField')) {
    const div = document.createElement('div');
    div.className = 'field full hidden additional-field';
    div.id = 'junkTypeField';
    div.innerHTML = `
      <label for="junkType">What would you like removed? <span class="required">*</span></label>
      <select id="junkType">
        <option value="">Select item or material type</option>
        <option value="Furniture and household items">Furniture and household items</option>
        <option value="Appliances">Standard household appliances</option>
        <option value="Boxes, bags, and general clutter">Boxes, bags, and general household clutter</option>
        <option value="Garage, basement, or attic cleanout">Garage, basement, or attic cleanout</option>
        <option value="Yard debris">Yard debris and outdoor items</option>
        <option value="Mixed household junk">Mixed household junk</option>
        <option value="Construction debris or heavy materials — custom quote">Construction debris, concrete, dirt, tile, or other heavy materials (custom quote)</option>
        <option value="Specialty or other items — custom quote">Mattresses, tires, electronics, refrigerators, or other specialty items (custom quote)</option>
      </select>
      <p class="estimate-note">Heavy materials and specialty items require review because disposal and handling costs vary.</p>
    `;
    grid.insertBefore(div, date);
  }

  if (!$('additionalAccessField')) {
    const div = document.createElement('div');
    div.className = 'field full hidden additional-field';
    div.id = 'additionalAccessField';

    div.innerHTML = `
      <label for="additionalDetails">Access &amp; Item Details</label>
      <textarea id="additionalDetails" rows="4"
        placeholder="Tell BB about stairs, gates, narrow access, heavy items, appliances, furniture, or anything else we should know."></textarea>
    `;

    grid.insertBefore(div, date);
  }

  if (!$('junkRequirementField')) {
    const div = document.createElement('div');
    div.className = 'field full hidden additional-field';
    div.id = 'junkRequirementField';

    div.innerHTML = `
      <div class="note">
        <strong>Junk Removal — Customer Authorization</strong>
        <p>You must own the items or have permission from the owner to authorize their removal. Only the items identified and approved for removal will be taken.</p>
        <p>BB SERVICES may sort suitable items for donation or recycling when practical. Resale or transfer of ownership will only occur with separate customer authorization.</p>
        <p><strong>Disposal fees:</strong> Landfill, transfer-station, recycling, mattress, appliance, and other specialty disposal charges are not included in the service charge. BB will disclose the applicable facility charge and obtain your approval before disposal. Documented disposal charges are billed separately at actual cost.</p>
        <label class="contact-check">
          <input type="checkbox" id="junkConditionAgreement">
          <span>I confirm that I own these items or am authorized by the owner to have them removed, and I understand that disposal fees are separate and require approval. <span class="required">*</span></span>
        </label>
        <label class="contact-check">
          <input type="checkbox" id="junkConditionAgreement">
          <span>I understand and agree not to intentionally damage usable
          items or their associated accessories before pickup.
          <span class="required">*</span></span>
        </label>
      </div>
    `;

    grid.insertBefore(div, date);
  }
}

function snowSaltField() {
  const grid = document.querySelector('#booking .grid');
  const date = $('date')?.parentElement;

  if (!grid || !date || $('snowSaltField')) return;

  const div = document.createElement('div');
  div.className = 'field full hidden additional-field';
  div.id = 'snowSaltField';

  div.innerHTML = `
    <label class="contact-check">
      <input type="checkbox" id="snowSalt">
      Include snow salt application in my quote request
    </label>
  `;

  grid.insertBefore(div, date);
}

function lawnSizeField() {
  const grid = document.querySelector('#booking .grid');
  const date = $('date')?.parentElement;

  if (!grid || !date || $('lawnSizeField')) return;

  const div = document.createElement('div');
  div.className = 'field full hidden additional-field';
  div.id = 'lawnSizeField';

  div.innerHTML = `
    <label for="lawnSize">
      Approximate Lawn Size <span class="required">*</span>
    </label>
    <select id="lawnSize" required>
      <option value="medium">Medium — up to 10,000 sq. ft. (standard)</option>
      <option value="small">Small — up to 5,000 sq. ft.</option>
      <option value="large">Large — 10,001–20,000 sq. ft.</option>
      <option value="xlarge">Extra Large — 20,001–30,000 sq. ft.</option>
    </select>
    <p class="estimate-note">
      Properties larger than 30,000 sq. ft. require a custom estimate.
    </p>
  `;

  grid.insertBefore(div, date);
}

function mode() {
  fields();
  snowSaltField();
  lawnSizeField();

  const service = v('service');
  const isAdditional = !!names[service];
  const isLawn = !!lawnNames[service];

  document.querySelectorAll('.additional-field').forEach(field => {
    field.classList.toggle('hidden', !isAdditional);
  });

  ['year', 'make', 'model', 'engine', 'trim'].forEach(id => {
    $(id)?.parentElement?.classList.toggle(
      'hidden',
      isAdditional || isLawn
    );
  });

  $('garageSizeField')?.classList.toggle('hidden', service !== GARAGE);
  $('junkLoadField')?.classList.toggle('hidden', service !== JUNK);
  $('junkRequirementField')?.classList.toggle('hidden', service !== JUNK);
  $('junkTypeField')?.classList.toggle('hidden', service !== JUNK);

  $('additionalAccessField')?.classList.toggle(
    'hidden',
    service !== GARAGE && service !== JUNK
  );

  $('lawnSizeField')?.classList.toggle('hidden', service !== 'lawn-mowing');
  $('snowSaltField')?.classList.toggle('hidden', !SNOW[service]);

  if (isAdditional) {
    if ($('title')) $('title').textContent = names[service];
    if ($('description')) {
      $('description').textContent =
        'Complete the information below for your ' +
        names[service].toLowerCase() + ' request.';
    }
  }
}

function openAdd(service) {
  addOption();
  addCategory();
  fields();

  $('service').value = service;

  $('automotive')?.classList.remove('open');
  $('additional-booking-services')?.classList.add('open');
  $('lawn-property-booking-services')?.classList.remove('open');

  $('booking')?.classList.add('open');

  mode();

  $('booking')?.scrollIntoView({ behavior: 'smooth' });
}

function openLawn(service) {
  addOption();
  addLawnCategory();
  fields();
  lawnSizeField();

  $('service').value = service;

  $('automotive')?.classList.remove('open');
  $('additional-booking-services')?.classList.remove('open');
  $('lawn-property-booking-services')?.classList.add('open');

  $('booking')?.classList.add('open');

  ['year', 'make', 'model', 'engine', 'trim'].forEach(id => {
    $(id)?.parentElement?.classList.add('hidden');
  });

  ['estimate', 'review', 'contact'].forEach(id => {
    $(id)?.classList.remove('open');
  });

  if ($('title')) {
    $('title').textContent =
      (lawnNames[service] || 'Lawn & Property Care') + ' Booking';
  }

  if ($('description')) {
    $('description').textContent =
      'Complete the information below for your ' +
      (lawnNames[service] || 'lawn & property care').toLowerCase() +
      ' request.';
  }

  $('lawnSizeField')?.classList.toggle('hidden', service !== 'lawn-mowing');

  if (typeof window.setStep === 'function') {
    window.setStep(2);
  }

  $('booking')?.scrollIntoView({ behavior: 'smooth' });
}

function openSnow(service) {
  addOption();
  addSnowCategory();
  snowSaltField();

  $('service').value = service;

  $('automotive')?.classList.remove('open');
  $('additional-booking-services')?.classList.remove('open');
  $('lawn-property-booking-services')?.classList.remove('open');
  $('snow-removal-booking-services')?.classList.add('open');

  $('booking')?.classList.add('open');

  ['year', 'make', 'model', 'engine', 'trim'].forEach(id => {
    $(id)?.parentElement?.classList.add('hidden');
  });

  document.querySelectorAll('.additional-field').forEach(field => {
    field.classList.add('hidden');
  });

  $('snowSaltField')?.classList.remove('hidden');

  ['estimate', 'review', 'contact'].forEach(id => {
    $(id)?.classList.remove('open');
  });

  if ($('title')) {
    $('title').textContent = SNOW[service] + ' Booking';
  }

  if ($('description')) {
    $('description').textContent =
      'Snow removal pricing will be quoted based on snowfall accumulation, ' +
      'the selected service area, and property conditions.';
  }

  if (typeof window.setStep === 'function') {
    window.setStep(2);
  }

  $('booking')?.scrollIntoView({ behavior: 'smooth' });
}

function total() {
  const service = v('service');

  if (service === GARAGE) {
    return garageRates[v('garageSize')] || 0;
  }

  if (service === JUNK) {
    if (/custom quote/i.test(v('junkType'))) return null;
    return junkRates[v('junkLoad')] || 0;
  }

  if (SNOW[service]) return null;

  return 0;
}

function validAdd() {
  if (SNOW[v('service')]) return true;

  if (v('service') === GARAGE && !garageRates[v('garageSize')]) {
    alert('Please select a garage size.');
    return false;
  }

  if (v('service') === JUNK) {
    if (!v('junkType')) {
      alert('Please select the type of items or materials to be removed.');
      $('junkType')?.focus();
      return false;
    }
    if (!junkRates[v('junkLoad')]) {
      alert('Please select an estimated junk load size.');
      return false;
    }

    if (!$('junkConditionAgreement')?.checked) {
      alert('Please confirm your authorization and understanding of separate disposal fees before continuing.');
      return false;
    }
  }

  return true;
}

function showAdditionalEstimate() {
  mode();

  if (!validAdd()) return;

  const isSnow = !!SNOW[v('service')];
  const isJunkQuote = v('service') === JUNK && /custom quote/i.test(v('junkType'));
  const amount = total();

  if ($('laborPrice')) {
    $('laborPrice').textContent = (isSnow || isJunkQuote)
      ? 'Quote required'
      : '
  }

  if ($('partsPrice')) {
    $('partsPrice').textContent = (isSnow || isJunkQuote)
      ? 'To be determined'
      : '$0.00';
  }

  if ($('totalPrice')) {
    $('totalPrice').textContent = (isSnow || isJunkQuote)
      ? 'Quote required'
      : '
  }

  const note = document.querySelector('#estimate .estimate-note');

  if (note && isJunkQuote) {
    note.textContent = 'This material or item category requires an individual review. BB will confirm labor, hauling, handling, and disposal costs with you before accepting the job.';
  } else if (note && v('service') === JUNK) {
    note.textContent = 'This estimate covers BB SERVICES labor, loading, and hauling only. Disposal, landfill, transfer-station, recycling, and specialty-item fees are not included. BB will confirm the applicable facility charges with you and obtain approval before disposal; approved charges are billed separately at documented actual cost. Heavy materials and specialty items require a custom quote.';
  }

  if (note && isSnow) {
    note.textContent =
      'BB will provide a quote based on snowfall accumulation, ' +
      'the selected service area, and property conditions. ' +
      'Pricing will be confirmed with you before scheduling.';
  }

  $('estimate')?.classList.add('open');
  $('p3')?.classList.add('active');

  $('estimate')?.scrollIntoView({ behavior: 'smooth' });
}

function interceptEstimateClick() {
  document.addEventListener('click', function (event) {
    const button = event.target.closest('#booking button.continue');

    if (!button || button.closest('#estimate')) return;

    const service = v('service');

    if (!names[service] && !lawnNames[service]) return;

    const buttonText = (button.textContent || '').trim().toLowerCase();

    if (buttonText !== 'get estimate') return;

    // Lawn services use the existing lawn pricing engine.
    if (lawnNames[service]) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    showAdditionalEstimate();
  }, true);
}

function init() {
  addOption();
  addCategory();
  addLawnCategory();
  addSnowCategory();

  fields();
  snowSaltField();

  interceptEstimateClick();

  $('service')?.addEventListener('change', () => {
    const service = v('service');

    if (SNOW[service]) {
      openSnow(service);
    } else if (lawnNames[service]) {
      openLawn(service);
    } else {
      mode();
    }
  });

  setTimeout(() => {
    addOption();
    addCategory();
    addLawnCategory();
    addSnowCategory();
    fields();
    snowSaltField();
  }, 300);

  setTimeout(() => {
    addOption();
    addCategory();
    addLawnCategory();
    addSnowCategory();

    if (location.hash === '#snow-removal-booking-services') {
      $('snow-removal-booking-services')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
 
 + amount.toFixed(2);
  }

  if ($('partsPrice')) {
    $('partsPrice').textContent = isSnow
      ? 'To be determined'
      : '$0.00';
  }

  if ($('totalPrice')) {
    $('totalPrice').textContent = isSnow
      ? 'Quote required'
      : '$' + amount.toFixed(2);
  }

  const note = document.querySelector('#estimate .estimate-note');

  if (note && v('service') === JUNK) {
    note.textContent = 'This estimate covers BB SERVICES labor, loading, and hauling only. Disposal, landfill, transfer-station, recycling, and specialty-item fees are not included. BB will confirm the applicable facility charges with you and obtain approval before disposal; approved charges are billed separately at documented actual cost. Heavy materials and specialty items require a custom quote.';
  }

  if (note && isSnow) {
    note.textContent =
      'BB will provide a quote based on snowfall accumulation, ' +
      'the selected service area, and property conditions. ' +
      'Pricing will be confirmed with you before scheduling.';
  }

  $('estimate')?.classList.add('open');
  $('p3')?.classList.add('active');

  $('estimate')?.scrollIntoView({ behavior: 'smooth' });
}

function interceptEstimateClick() {
  document.addEventListener('click', function (event) {
    const button = event.target.closest('#booking button.continue');

    if (!button || button.closest('#estimate')) return;

    const service = v('service');

    if (!names[service] && !lawnNames[service]) return;

    const buttonText = (button.textContent || '').trim().toLowerCase();

    if (buttonText !== 'get estimate') return;

    // Lawn services use the existing lawn pricing engine.
    if (lawnNames[service]) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    showAdditionalEstimate();
  }, true);
}

function init() {
  addOption();
  addCategory();
  addLawnCategory();
  addSnowCategory();

  fields();
  snowSaltField();

  interceptEstimateClick();

  $('service')?.addEventListener('change', () => {
    const service = v('service');

    if (SNOW[service]) {
      openSnow(service);
    } else if (lawnNames[service]) {
      openLawn(service);
    } else {
      mode();
    }
  });

  setTimeout(() => {
    addOption();
    addCategory();
    addLawnCategory();
    addSnowCategory();
    fields();
    snowSaltField();
  }, 300);

  setTimeout(() => {
    addOption();
    addCategory();
    addLawnCategory();
    addSnowCategory();

    if (location.hash === '#snow-removal-booking-services') {
      $('snow-removal-booking-services')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
 
 + amount.toFixed(2);
  }

  const note = document.querySelector('#estimate .estimate-note');

  if (note && v('service') === JUNK) {
    note.textContent = 'This estimate covers BB SERVICES labor, loading, and hauling only. Disposal, landfill, transfer-station, recycling, and specialty-item fees are not included. BB will confirm the applicable facility charges with you and obtain approval before disposal; approved charges are billed separately at documented actual cost. Heavy materials and specialty items require a custom quote.';
  }

  if (note && isSnow) {
    note.textContent =
      'BB will provide a quote based on snowfall accumulation, ' +
      'the selected service area, and property conditions. ' +
      'Pricing will be confirmed with you before scheduling.';
  }

  $('estimate')?.classList.add('open');
  $('p3')?.classList.add('active');

  $('estimate')?.scrollIntoView({ behavior: 'smooth' });
}

function interceptEstimateClick() {
  document.addEventListener('click', function (event) {
    const button = event.target.closest('#booking button.continue');

    if (!button || button.closest('#estimate')) return;

    const service = v('service');

    if (!names[service] && !lawnNames[service]) return;

    const buttonText = (button.textContent || '').trim().toLowerCase();

    if (buttonText !== 'get estimate') return;

    // Lawn services use the existing lawn pricing engine.
    if (lawnNames[service]) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    showAdditionalEstimate();
  }, true);
}

function init() {
  addOption();
  addCategory();
  addLawnCategory();
  addSnowCategory();

  fields();
  snowSaltField();

  interceptEstimateClick();

  $('service')?.addEventListener('change', () => {
    const service = v('service');

    if (SNOW[service]) {
      openSnow(service);
    } else if (lawnNames[service]) {
      openLawn(service);
    } else {
      mode();
    }
  });

  setTimeout(() => {
    addOption();
    addCategory();
    addLawnCategory();
    addSnowCategory();
    fields();
    snowSaltField();
  }, 300);

  setTimeout(() => {
    addOption();
    addCategory();
    addLawnCategory();
    addSnowCategory();

    if (location.hash === '#snow-removal-booking-services') {
      $('snow-removal-booking-services')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
 
 + amount.toFixed(2);
  }

  if ($('partsPrice')) {
    $('partsPrice').textContent = isSnow
      ? 'To be determined'
      : '$0.00';
  }

  if ($('totalPrice')) {
    $('totalPrice').textContent = isSnow
      ? 'Quote required'
      : '$' + amount.toFixed(2);
  }

  const note = document.querySelector('#estimate .estimate-note');

  if (note && v('service') === JUNK) {
    note.textContent = 'This estimate covers BB SERVICES labor, loading, and hauling only. Disposal, landfill, transfer-station, recycling, and specialty-item fees are not included. BB will confirm the applicable facility charges with you and obtain approval before disposal; approved charges are billed separately at documented actual cost. Heavy materials and specialty items require a custom quote.';
  }

  if (note && isSnow) {
    note.textContent =
      'BB will provide a quote based on snowfall accumulation, ' +
      'the selected service area, and property conditions. ' +
      'Pricing will be confirmed with you before scheduling.';
  }

  $('estimate')?.classList.add('open');
  $('p3')?.classList.add('active');

  $('estimate')?.scrollIntoView({ behavior: 'smooth' });
}

function interceptEstimateClick() {
  document.addEventListener('click', function (event) {
    const button = event.target.closest('#booking button.continue');

    if (!button || button.closest('#estimate')) return;

    const service = v('service');

    if (!names[service] && !lawnNames[service]) return;

    const buttonText = (button.textContent || '').trim().toLowerCase();

    if (buttonText !== 'get estimate') return;

    // Lawn services use the existing lawn pricing engine.
    if (lawnNames[service]) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    showAdditionalEstimate();
  }, true);
}

function init() {
  addOption();
  addCategory();
  addLawnCategory();
  addSnowCategory();

  fields();
  snowSaltField();

  interceptEstimateClick();

  $('service')?.addEventListener('change', () => {
    const service = v('service');

    if (SNOW[service]) {
      openSnow(service);
    } else if (lawnNames[service]) {
      openLawn(service);
    } else {
      mode();
    }
  });

  setTimeout(() => {
    addOption();
    addCategory();
    addLawnCategory();
    addSnowCategory();
    fields();
    snowSaltField();
  }, 300);

  setTimeout(() => {
    addOption();
    addCategory();
    addLawnCategory();
    addSnowCategory();

    if (location.hash === '#snow-removal-booking-services') {
      $('snow-removal-booking-services')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, 1000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
 
