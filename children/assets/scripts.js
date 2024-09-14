const oneEmojiRender = ({ emoji, name }) => {
  return `<section class="one">
    <div>
      <span class="emoji">${emoji}</span>
      <div class="name" onclick="speak('${name}')">${name}</div>
    </div>
  </section>`
}