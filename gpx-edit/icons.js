function removeFinishIcon() {
  return crEl('span', {c: 'action'},
    crEl('b'),
    crEl('span'),
    crEl('small'),
    crEl('span'),
    crEl('small', {c: 'active remove'}),
    crEl('span', {c: 'remove'}),
    crEl('b', {c: 'remove'}, '×')
  )
}

function removeStartIcon() {
  return crEl('span', {c: 'action'},
    crEl('b', {c: 'remove'}, '×'),
    crEl('span', {c: 'remove'}),
    crEl('small', {c: 'active remove'}),
    crEl('span'),
    crEl('small'),
    crEl('span'),
    crEl('b'),
  )
}

function addFinishIcon() {
  return crEl('span', {c: 'action'},
    crEl('b'),
    crEl('span'),
    crEl('small'),
    crEl('span'),
    crEl('small', {c: 'active add'}),
    crEl('span', {c: 'add'}),
    crEl('b', {c: 'add'}, '+')
  )
}

function addStartIcon() {
  return crEl('span', {c: 'action'},
    crEl('b', {c: 'add'}, '+'),
    crEl('span', {c: 'add'}),
    crEl('small', {c: 'active add'}),
    crEl('span'),
    crEl('small'),
    crEl('span'),
    crEl('b'),
  )
}

function editMiddleIcon() {
  return crEl('span', {c: 'action'},
    crEl('b'),
    crEl('span'),
    crEl('small', {c: 'edit active'}),
    crEl('span', {c: 'edit'}),
    crEl('small', {c: 'edit active'}),
    crEl('span'),
    crEl('b')
  )
}