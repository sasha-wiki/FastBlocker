const namespace = mw.config.get( 'wgCanonicalSpecialPageName' );
let username;

const listMotiveOptions = [
	{ name: 'Vandalismo de páginas' },
	{ name: 'Cuenta creada para vandalizar' },
	{ name: 'Usuario títere' },
	{ name: 'LTA' },
];

const listDurationOptions = [
	{ name: '31 horas',
        value: '31 hours' },
	{ name: 'para siempre',
        value: 'never' },
];

function getUsername( element ) {
    // global namespace
    let username;
    try {
        username = element
            .parent()
            .get( 0 )
            .previousElementSibling
            .textContent;
    } catch ( e ) {
        if ( e instanceof TypeError && namespace === 'Watchlist' ) {
            username = element
                .parents()
                .siblings( '.mw-changeslist-line-inner-userLink' )
                .find( '.mw-userlink' )
                .text();
        } else {
            console.log( e );
        }
    }
    return username.trim();
}

function getOptions( list ) {
	let dropDownOptions = [];
	for (let a of list) {
		let option = { type: 'option', value: a.value || a.name, label: a.name, checked: a.default };
		dropDownOptions.push(option);
	}
	return dropDownOptions;
}

function createFormWindow() {
    let Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('FastBlocker');
    Window.setTitle(`Bloquear`);
    let form = new Morebits.quickForm(submitBlock);

    let textAreaAndReasonField = form.append({
		type: 'field',
		label: 'Opciones:',
	});

	textAreaAndReasonField.append({
		type: 'select',
		name: 'motive',
		label: 'Motivo:',
		list: getOptions( listMotiveOptions ),
		disabled: false
	});

    textAreaAndReasonField.append({
		type: 'select',
		name: 'time',
		label: 'Duración:',
		list: getOptions( listDurationOptions ),
		disabled: false
	});

    form.append({
		type: 'submit',
		label: 'Aceptar'
	});

	let result = form.render();
	Window.setContent( result );
	Window.display();
}

function submitBlock( e ) {
    let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
    new mw.Api().postWithToken( 'csrf', {
        action: 'block',
        user: username,
        expiry: input.time,
        reason: input.motive,
        nocreate: true,
        autoblock: true,
        anononly: true,
    } ).then( function () {
        mw.notify( `${username} ha sido bloqueado.` );
    } );
}

function createUserToolButton() {
    mw.hook( 'wikipage.content' ).add( function( obj ) {
        obj.find( 'span.mw-usertoollinks' ).each( function ( idx, element ) {
            $( element ).contents().last().after( ' · ',
                $( '<a>' ).attr( 'href', '#' )
                    .text( 'bloqueo rápido' )  
                    .click( function() {
                        username = getUsername( $( this ) );
                        createFormWindow();
                    })
            );
        });
    });
}

const loadDependencies = ( callback ) => {
    mw.loader.using( [ 'mediawiki.api', 'mediawiki.util' ] );
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
