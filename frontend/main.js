import m from 'mithril';

import login from './login';
import { img, footer, div, article, button } from './tags';

import images from "*.png"
import auth from './auth';
import dashboard from './dashboard';
import publicinfo from './publicinfo';

let text = 'HJH';

m.mount(document.body, {
    view: vnode => [
        auth.isLoggedIn() ?
        m(dashboard) : m(publicinfo),

        footer.sticky(
            auth.connected() ? button('Connected') : button('Not Connected'),
            m(login),
            // img.logo({ src: images.logo }),
        )
    ]
})