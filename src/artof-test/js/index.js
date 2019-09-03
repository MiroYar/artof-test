function createElement(tag, props, parent){
    const element = document.createElement(tag);

    Object.keys(props).forEach(key => element[key] = props[key]);

    parent.appendChild(element);

    return element;
}

function toggleNavParent() {
    let screenWidth = window.innerWidth;
    const HEADER = document.querySelector('.header');
    const HEADER_WRAP = HEADER.querySelector('.header__wrap');
    const PHONE = HEADER.querySelector('.phone');
    const NAV = HEADER.querySelector('.nav');

    if (screenWidth > 610 && NAV.parentElement === HEADER){
        const NAV_ITEM = PHONE.parentElement;
        HEADER_WRAP.insertBefore(PHONE, HEADER_WRAP.children[0]);
        NAV_ITEM.remove();
        HEADER_WRAP.appendChild(NAV);
        HEADER.classList.remove('header_smphone');

        FEATURES_SLIDER.classList.add('features__slider_hidden');
        FEATURES_WRAP.classList.remove('features__wrap_hidden');
    }
    else if (screenWidth <= 610 && NAV.parentElement === HEADER_WRAP){
        const NAV_WRAP = NAV.querySelector('.nav__wrap');
        const NAV_ITEM = createElement('li', { className: 'nav__item'}, NAV_WRAP);
        NAV_ITEM.appendChild(PHONE);
        HEADER.appendChild(NAV);
        HEADER.classList.add('header_smphone');

        
        FEATURES_WRAP.classList.add('features__wrap_hidden');
    }
}

function hiddenFeatures(){
    let screenWidth = window.innerWidth;
    const FEATURES_SLIDER = document.querySelector('.features__slider');
    const FEATURES_WRAP = document.querySelector('.features__wrap');

    if (screenWidth > 610){
        FEATURES_SLIDER.classList.add('features__slider_hidden');
        FEATURES_WRAP.classList.remove('features__wrap_hidden');
    }
    else if (screenWidth <= 610) {
        FEATURES_SLIDER.classList.remove('features__slider_hidden');
        FEATURES_WRAP.classList.add('features__wrap_hidden');
    }
}

function addEventOnNavBTN(){
    const NAV_BTN = document.querySelector('.servicebar__navbtn');
    NAV_BTN.onclick = () => {
        const NAV = document.querySelector('.nav');
        NAV.classList.toggle('nav_down');
    };
}

function addEventOnSearcBTN(){
    const SEARH_BTN = document.querySelector('.servicebar__searchbtn');
    SEARH_BTN.onclick = () => {
        const BODY = document.querySelector('body');
        BODY.classList.toggle('body_noimg');
    };
}

window.addEventListener('resize', toggleNavParent);
window.addEventListener('resize', hiddenFeatures);
window.addEventListener('load', toggleNavParent);
window.addEventListener('load', hiddenFeatures);
window.addEventListener('load', addEventOnNavBTN);
window.addEventListener('load', addEventOnSearcBTN);

$('.mainslider').slick({
    dots: true
});

$('.features__slider').slick({
    dots: true
});

(() => {
	let formElemFilled = function formElemFilled(e) {
		(e.type == 'checkbox') ? result = e.checked : result = e.value != '';
		return result;
	}
	
	let sendFormData = function sendFormData(element){
		const CHILDS = element.getElementsByTagName('*');
		const TAGSSENTELEM = ['INPUT'];
		let data = '';
		let first = true;
		
		for (let i = 0; i < CHILDS.length; i++) {
			const e = CHILDS[i];
			let r = '';
	
			if (TAGSSENTELEM.includes(e.tagName) && formElemFilled(e) != false){
				(first == false) ? r = '&': first = false;
				data = `${data}${r}${e.name}=${e.value}`;
			}
		}
	
		return data;
	}

	let ajax = (method, url, data, done) => {
		const request = new XMLHttpRequest();

		request.addEventListener('readystatechange', () => {
			if(request.readyState === 4 && request.status === 200) {       
				done();console.log(data);
			}
		});

		if (method === 'GET'){
			url = `${url}?${data}`;
			data = '';
		}
		
		request.open(method, url);

		request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		request.send(data);
	}
	
	const FORM = document.querySelector('.subform');
	FORM.addEventListener('submit', function(e) {
		e.preventDefault()
		ajax('POST', 'php/email.php', sendFormData(FORM), function(){
			FORM.reset();
		});
	});
})();