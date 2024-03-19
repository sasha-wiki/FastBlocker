const namespace = mw.config.get('wgCanonicalSpecialPageName');
let username;

const listMotiveOptions = [
	{ name: 'Vandalismo de páginas', value: '[[WP:VN|Vandalismo de páginas]]' },
	{ name: 'Cuenta creada para vandalizar', value: '[[WP:VN|Cuenta creada para vandalizar]]' },
    { name: 'CPP', value: '[[WP:CPP|Cuenta con propósito particular]]' },
    { name: 'Nombre de usuario inapropiado', value: '[[WP:NU|Viola la política de nombres de usuario]]' },
	{ name: 'Usuario títere', value: '[[WP:UT#Situaciones de prohibición|Abuso de múltiples cuentas y/o evasión de bloqueo local o global]] ' },
	{ name: 'LTA', value: '[[Wikipedia:Abuso a largo plazo|Abuso a largo plazo (LTA)]]' },
    { name: 'Spam', value: '[[WP:SPAM|Spam]]' },
    { name: 'Proxy abierto', value: '[[Wikipedia:Proxies abiertos|Proxy abierto]], [[Zombi (informática)|zombi]] o [[botnet]]' }
];

const listDurationOptions = [
    { name: 'para siempre', value: 'never' },
	{ name: '31 horas', value: '31 hours', default: true },
    { name: '3 días', value: '3 days' },
    { name: '1 semana', value: '1 week' },
    { name: '2 semanas', value: '2 weeks' },
    { name: '1 mes', value: '1 month' },
    { name: '2 meses', value: '2 months' },
    { name: '3 meses', value: '3 months' },
    { name: '6 meses', value: '6 months' },
    { name: '1 año', value: '1 year' },
    { name: '2 años', value: '2 years' }
];

function getUsername(element) {
    // global namespace
    let username;
    try {
        username = element
            .parent()
            .get(0)
            .previousElementSibling
            .textContent;
    } catch (e) {
        if (e instanceof TypeError && namespace === 'Watchlist') {
            username = element
                .parents()
                .siblings('.mw-changeslist-line-inner-userLink')
                .find('.mw-userlink')
                .text();
        } else {
            console.log(e);
        }
    }
    return username.trim();
}

function getOptions(list) {
	let dropDownOptions = [];
	for (let a of list) {
		let option = { type: 'option', value: a.value, label: a.name, selected: a.default };
		dropDownOptions.push(option);
	}
	return dropDownOptions;
}

function createFormWindow() {
    let Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('FastBlocker');
    Window.setTitle(`Bloquear a ${username}`);
    let form = new Morebits.quickForm(submitBlock);

    let blockOptions = form.append({
		type: 'field',
		label: 'Opciones:',
	});

	blockOptions.append({
		type: 'select',
		name: 'motive',
		label: 'Motivo:',
		list: getOptions(listMotiveOptions),
		disabled: false
	});

    blockOptions.append({
		type: 'select',
		name: 'time',
		label: 'Duración:',
		list: getOptions(listDurationOptions),
		disabled: false
	});

    form.append({
		type: 'submit',
		label: 'Aceptar'
	});

	let result = form.render();
	Window.setContent(result);
	Window.display();
}

function submitBlock(e) {
    let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
    new mw.Api().postWithToken('csrf', {
        action: 'block',
        user: username,
        expiry: input.time,
        reason: input.motive,
        nocreate: true,
        autoblock: true,
        anononly: true,
    }).then(function() {
        mw.notify(`${username} ha sido bloqueado.`);
    });
}

function createUserToolButton() {
    mw.hook('wikipage.content').add(function(obj) {
        obj.find('span.mw-usertoollinks').each(function(idx, element) {
            $(element).contents().last().after(' · ',
                $('<a>').attr('href', '#')
                    .text('bloqueo rápido')  
                    .click(function() {
                        username = getUsername($(this));
                        createFormWindow();
                    })
            );
        });
    });
}

const loadDependencies = (callback) => {
    mw.loader.using(['mediawiki.api', 'mediawiki.util']);
    callback();
};

const loadMorebits = (callback) => {
    mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript', 'text/javascript');
    mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');
    callback();
};

const main = () => {
    loadDependencies(() => {
        loadMorebits(() => {
            createUserToolButton();
        });
    });
};

main();