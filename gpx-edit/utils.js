function latlng2distance(lat1, long1, lat2, long2) {
    //радиус Земли

    var R = 6372795;
    //перевод коордитат в радианы
    lat1 *= Math.PI / 180;
    lat2 *= Math.PI / 180;
    long1 *= Math.PI / 180;
    long2 *= Math.PI / 180;
    //вычисление косинусов и синусов широт и разницы долгот
    var cl1 = Math.cos(lat1);
    var cl2 = Math.cos(lat2);
    var sl1 = Math.sin(lat1);
    var sl2 = Math.sin(lat2);
    var delta = long2 - long1;
    var cdelta = Math.cos(delta);
    var sdelta = Math.sin(delta);
    //вычисления длины большого круга
    var y = Math.sqrt(Math.pow(cl2 * sdelta, 2) + Math.pow(cl1 * sl2 - sl1 * cl2 * cdelta, 2));
    var x = sl1 * sl2 + cl1 * cl2 * cdelta;
    var ad = Math.atan2(y, x);
    var dist = ad * R; //расстояние между двумя координатами в метрах
    return dist
}

function calculateTimeMs(distance, speedKmh) {
    // Переводим скорость из км/ч в м/с: v(м/с) = v(км/ч) * 1000 / 3600
    const speedMs = speedKmh * (1000 / 3600);
    
    // Вычисляем время в секундах: t = S / v
    const timeSeconds = distance / speedMs;
    
    // Переводим секунды в миллисекунды (1 с = 1000 мс)
    const timeMs = timeSeconds * 1000;
    
    return timeMs;
}

function getInputDate(d) {
  const timeOffset = new Date().getTimezoneOffset();
  return new Date(d.getTime() - timeOffset * 60000).toISOString().substring(0,16)
}

function requestDateModal(startDate, distanceInMeters, meterPerSec) {
  return new Promise((res) => {
    const maxDate = new Date(startDate.getTime() + 86400000);

    const secBySpeed = distanceInMeters / meterPerSec;
    const computedFinishDate = new Date(startDate.getTime() + (secBySpeed * 1000))


    const info = crEl('small', {}, 'Выберите дату');

    const updateInfo = () => {
      if (!document.getElementById('finishDate')) return
      const cur = new Date(document.getElementById('finishDate').value);
      const diffInSec = (cur.getTime() - startDate.getTime() ) / 1000;
      const meterSecSpeed = distanceInMeters / diffInSec;
      info.textContent = `${distanceInMeters.toFixed(2)}м. со скоростью ${(meterSecSpeed * 3.6).toFixed(1)} км/ч`
    }

    const di = crEl('dialog',
      crEl('h5', 'Дата финиша'),
       crEl('form', {e: {submit: (e) => {
          e.preventDefault();

          res(document.getElementById('finishDate').value)
         
          di.close();
          di.remove()
        }}},
          crEl('p',
            `Мы рассчитали дату финиша на основе последних 100 точек`,
            crEl('br'),
            crEl('small', `(зная среднюю скорость ${(meterPerSec * 3.6).toFixed(1)}км/ч и расстояние ${distanceInMeters.toFixed(2)}м.)`)),
          crEl('p', `Если вам известна более точная дата финиша, укажите ее в поле ниже:`),
          crEl('input', {
            type:'datetime-local',
            required: true,
            value: getInputDate(computedFinishDate),
            min: getInputDate(startDate),
            max: getInputDate(maxDate),
            id: 'finishDate',
            e: {change: updateInfo}
          }),
          crEl('br'),
          info,
          crEl('br'),crEl('hr'),crEl('br'),
          crEl('button', {type:'submit'}, 'Сохранить и скачать GPX'),
        )
    );

    
    document.body.append(di)
    di.showModal();
    updateInfo();
  })
}


function saveGpxStringAsFile(xmlString, filename) {
    const blob = new Blob([xmlString], { type: 'application/gpx+xml' });

    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        URL.revokeObjectURL(a.href);
    }, 10000); // Revoke the URL after delay
}
