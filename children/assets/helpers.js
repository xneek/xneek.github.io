function getPraise() {
  const words = [
    'Умница',
    'Молодец',
    'Умничка',
    'Молодчинка',
    'Здорово',
    'Классно',
    'Замечательно',
    'Великолепно',
    'Чудесно',
    'Прекрасно',
    'Восхетительно',
    'Класс',
    'Суппер'
  ];
  return words[Math.floor(Math.random()* words.length)];
}