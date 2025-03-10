export const revertDateTime = (formattedDate) => {
  let [datePart, timePart] = formattedDate.split('T');
  let [year, month, day] = datePart.split('-').map(Number);
  let [hours, minutes] = timePart.split(':').map(Number);

  let period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  let date = `${month}/${day}/${year}`;
  let time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;

  return { date, time };
}

export const combineDateTime = (dateStr, timeStr) => {
  let [month, day, year] = dateStr.split('/').map(Number);

  let [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  let formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  return formattedDate;
}