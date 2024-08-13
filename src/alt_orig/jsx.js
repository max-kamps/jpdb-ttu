import { showError } from './content/toast.js';
export function jsxCreateElement(name, props, ...content) {
    const elem = document.createElement(name);
    if (props) {
        for (const [key, value] of Object.entries(props)) {
            if (key.startsWith('on')) {
                if (value instanceof Function) {
                    elem.addEventListener(key.replace(/^on/, ''), async (...args) => {
                        try {
                            await value(...args);
                        }
                        catch (error) {
                            showError(error);
                        }
                    });
                }
                else {
                    elem.addEventListener(key.replace(/^on/, ''), value);
                }
            }
            else if (value !== false) {
                elem.setAttribute(key, value);
            }
        }
    }
    elem.append(...content.flat());
    return elem;
}
