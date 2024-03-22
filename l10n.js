// Localization to Spanish module

const timeDictionary = {
    second: 'segundo',
    seconds: 'segundos',
    minute: 'minuto',
    minutes: 'minutos',
    hour: 'hora',
    hours: 'horas',
    day: 'día',
    days: 'días',
    week: 'semana',
    weeks: 'semanas',
    month: 'mes',
    months: 'meses',
    year: 'año',
    years: 'años',
    decade: 'década',
    decades: 'décadas'
};

function translateDuration(duration) {
    if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(duration)) {
        return 'hasta el ' + parseTimestamp(duration);
    };
    let durationArray = duration.split(' ');
    for (let word in durationArray) {
        if (/\d+/.test(durationArray[word])) {
            continue;
        };
        if (timeDictionary[durationArray[word]]) {
            [durationArray[word]] = timeDictionary[durationArray[word]];
        };
        return durationArray.join(' ');
    };
}

function parseTimestamp(timestamp) {
    let date = new Date(timestamp);
    return date.toLocaleDateString('es-ES');
}


export function translateBlockLog (timestamp, action, user, duration) {
    let marcaDeTiempo, duracion;

    marcaDeTiempo = parseTimestamp(timestamp);
    if (action === 'unblock') {
        return `${marcaDeTiempo}: Fue desbloqueado por ${user}. `;
    };
    duracion = translateDuration(duration);

    return `${marcaDeTiempo}: Fue bloqueado por ${user} ${tiempo}. `;
}