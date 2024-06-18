import { findElement, withElement } from '@lib/renderer';

const hiddenInput = findElement<'input'>('#showPopupKey');

withElement('showPopupKeyButton', (el: HTMLInputElement) => {});
