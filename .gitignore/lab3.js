const location = 'Moscow';
const token = 'token';
const request = require('request');
const fs = require('fs');

function dataWrite(events) {
    let dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let eventLog = '';
    let currentDay = -1;
    for (let i = 0; i < events.length; i++) {
        let date = new Date(events[i].start.utc);
        let day = date.getDay();
        eventLog += `<div>
						<h1>${currentDay !== day ? dow[day] : ''}</h1>
						<h2><a href="${events[i].url}">${events[i].name.text}</a></h2>
						Date: ${date}<br/>
						${events[i].description.text}
						<hr/>
					</div>`;
        currentDay = day;
    }
    const html = `
		<!DOCTYPE html>
		<html charset="utf-8">
		<head>
		</head>
		<body>
			${eventLog}
		</body>
		</html>
		`;
    fs.writeFile('./events.html', html, function(error) {
        if(error) {
            return console.log(error);
        }
        console.log('Get events');
    });
}

function scanEvents(callback, page=1, events) {
    console.log(`Страница ${page} получена`);
    request({
            url: 'https://www.eventbriteapi.com/v3/events/search/',
            qs: {
                token: token,
                subcategories: 1000,
                sort_by: 'date',
                'start_date.keyword': 'next_week',
                'location.address': location,
                page
            },
            method: 'GET',
            json: true
        },
        (error, response, body) => {
        if (error) {
            return;
        }
        events = events ? events.concat(body.events) : body.events;
    if (body.pagination.page_count <= page) {
        callback(events);
    } else {
        scanEvents(callback, page + 1, events);
		}
	});
}

scanEvents(dataWrite);