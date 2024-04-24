import axios from 'axios';

function getWorkingDays() {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    const currentHour = currentDate.getHours();

    // Array to hold the working days
    let workingDays = [];

    // Function to add days to the current date
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    // Calculate working days based on current day of the week
    switch (currentDayOfWeek) {
        case 0: // Sunday
            currentDate.setDate(currentDate.getDate() + 1); // Move to Monday
            for (let i = 0; i <= 4; i++) {
                workingDays.push(addDays(currentDate, i));
            }
        case 6: // Saturday
            currentDate.setDate(currentDate.getDate() + 2); // Move to Monday
            for (let i = 0; i <= 4; i++) {
                workingDays.push(addDays(currentDate, i));
            }
            break;
        case 1: // Monday
            for (let i = 0; i <= 4; i++) {
                workingDays.push(addDays(currentDate, i));
            }
            break;
        case 2: // Tuesday
            for (let i = -1; i <= 3; i++) {
                workingDays.push(addDays(currentDate, i));
            }
            break;
        case 3: // Wednesday
            for (let i = -2; i <= 2; i++) {
                workingDays.push(addDays(currentDate, i));
            }
            break;
        case 4: // Thursday
            for (let i = -3; i <= 1; i++) {
                workingDays.push(addDays(currentDate, i));
            }
            break;
        case 5: // Friday
            if (currentHour >= 20) {
                currentDate.setDate(currentDate.getDate() + 3); // Move to Monday of next week
                for (let i = 0; i <= 4; i++) {
                    workingDays.push(addDays(currentDate, i));
                }
            }
            for (let i = -4; i <= 0; i++) {
                workingDays.push(addDays(currentDate, i));
            }
            break;
    }

    // Format dates to MM/DD/YYYY
    workingDays = workingDays.map(date => date.toLocaleDateString('en-US'));
    return workingDays;
}

async function fetchAndParseOneWorkingDay(tel, date) {
    const url = `https://edtmobiliteng.wigorservices.net//WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${tel}&date=${date}%208:00`;
    try {
        axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
        axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        const response = await axios.get(url);
        const html = await response.data
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const lignes = doc.querySelectorAll('.Ligne');
        const daySchedule = [];
        lignes.forEach(ligne => {
            // Extract data from each 'Ligne' element
            const debut = ligne.querySelector('.Debut').textContent.trim();
            const fin = ligne.querySelector('.Fin').textContent.trim();
            const matiere = ligne.querySelector('.Matiere').textContent.trim();
            const salle = ligne.querySelector('.Salle').textContent.trim();
            const prof = ligne.querySelector('.Prof').textContent.trim();

            // Push the extracted data into the 'schedule' array
            daySchedule.push({
                debut,
                fin,
                matiere,
                salle,
                prof
            });
        });
        return daySchedule;
    } catch (error) {
        console.error('Error fetching or parsing schedule for :', error);
        return null;
    }
}

function addDays(weekSchedule){
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const scheduleByDay = [];
    weekSchedule.forEach((day, index) => {
        const dayOfWeek = days[index];
        const dayObject = {
            day: dayOfWeek,
            courses: day
        };
        scheduleByDay.push(dayObject);
    });
    return scheduleByDay
}

export default async function fetchAndParseSchedule(tel) {
    const workingDays = getWorkingDays();
    let weekSchedule = []
    for (let i = 0; i < workingDays.length; i++) {
        await fetchAndParseOneWorkingDay(tel, workingDays[i]).then(workingDay => {
            weekSchedule.push(workingDay);
        })
    }
    return addDays(weekSchedule);
}

