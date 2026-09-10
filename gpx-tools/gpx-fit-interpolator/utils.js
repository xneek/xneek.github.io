/**
 * Рассчитывает расстояние между двумя точками на Земле в метрах
 * @param {[number, number]} point1 - Массив [широта, долгота] первой точки
 * @param {[number, number]} point2 - Массив [широта, долгота] второй точки
 * @returns {number} Расстояние в метрах
 */
function haversineDistanceMeters(point1, point2) {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;

    const EARTH_RADIUS = 6371000; // Средний радиус Земли в метрах

    // Перевод градусов в радианы
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const rLat1 = lat1 * Math.PI / 180;
    const rLat2 = lat2 * Math.PI / 180;

    // Формула гаверсинуса
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(rLat1) * Math.cos(rLat2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS * c;
}

// Пример использования (Кремль -> Парк Горького):
// const pointA = [55.7522, 37.6156]; 
// const pointB = [55.7290, 37.6015];

// const distance = haversineDistanceMeters(pointA, pointB);
// console.log(`Расстояние: ${distance.toFixed(1)} м`); // ~2720.9 м


/**
 * Точка [lat, lon, alt] на заданном кумулятивном расстоянии.
 * Линейная интерполяция внутри сегмента.
 */
function pointAtDistance(A, cumDist, targetDist) {
  const total = cumDist[cumDist.length - 1];

  if (targetDist <= 0) return A[0].slice();
  if (targetDist >= total) return A[A.length - 1].slice();

  // Находим сегмент [lo, hi], в который попадает targetDist
  let lo = 0;
  let hi = cumDist.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cumDist[mid] <= targetDist) lo = mid;
    else hi = mid;
  }

  const segLen = cumDist[hi] - cumDist[lo] || 1;
  const k = (targetDist - cumDist[lo]) / segLen;

  const [lat1, lon1, alt1 = 0] = A[lo];
  const [lat2, lon2, alt2 = 0] = A[hi];

  return [
    lat1 + (lat2 - lat1) * k,
    lon1 + (lon2 - lon1) * k,
    alt1 + (alt2 - alt1) * k,
  ];
}