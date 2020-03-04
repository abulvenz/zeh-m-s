import m from 'mithril';

import login from './login';
import { img, footer, div, article, button } from './tags';

import images from "*.png"
import auth from './auth';

let text = 'HJH';

m.mount(document.body, {
    view: vnode => [

        div.container(
            article.h100vh(
                button({ onclick: e => auth.request({ url: '/protected/secret' }).then(r => text = r.text) }, 'Get the secret'),
                text
            ),

        ),
        footer.sticky(
            auth.connected() ? button('Connected') : button('Not Connected'),
            m(login),
            // img.logo({ src: images.logo }),
        )
    ]
})