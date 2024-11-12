// @reader content-script

// Code for adding review button to search pages taken graciously from daruko's script
// I've been using his script for a long time now and figured I'd throw it in here so it
// might get even more use. Thank you darkuo-san

// START daruko's SCRIPT

// @name         JPDB add review button in vocabulary
// @version      0.2
// @description  Adds a button to force-review a word from its vocabulary page in JPDB
// @author       daruko
// @grant        none
// @license      MIT

document.querySelectorAll('.result.vocabulary').forEach(entry => {
  const menu = entry.querySelector('.menu');
  const v = entry.querySelector("form.link-like input[name='v']")?.getAttribute('value') ?? '';
  const s = entry.querySelector("form.link-like input[name='s']")?.getAttribute('value') ?? '';
  const href = `/review?c=vf,${v},${s}`;
  if (menu && s && v) {
    menu.after(createLink(href));
  }
});

function createLink(href: string) {
  const wrapper = document.createElement('div');
  const a = document.createElement('a');
  a.href = href;
  a.appendChild(document.createTextNode('Review'));
  wrapper.appendChild(a);
  return wrapper;
}

// END daruko'S SCRIPT
