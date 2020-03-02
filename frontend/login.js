import m from 'mithril';
import { div, form, span, label, input, button, img, b, a } from './tags';

import images from './images/*.png';
import auth from './auth';

let hidden = true;


export default vnode => {
    return {
        view: vnode => [
            button.login({ "onclick": e => document.getElementById('id01').style.display = 'block', "style": { "width": "auto" } },
                "Login"
            ),
            div.modal.$id01(
                form.modalContent.animate([
                    div.imgcontainer([
                        span.close({ "onclick": e => document.getElementById('id01').style.display = 'none', "title": "Close Modal" },
                            m.trust("&times;")
                        ),
                        img.avatar({ "src": images.img_avatar2, "alt": "Avatar" })
                    ]),
                    div.container([
                        label({ "for": "uname" },
                            b(
                                "Username"
                            )
                        ),
                        input.login({ "type": "text", "placeholder": "Enter Username", "name": "uname", "required": "required", oninput: e => auth.setEmail(e.target.value) }),
                        label({ "for": "psw" },
                            b(
                                "Password"
                            )
                        ),
                        input.login({ "type": "password", "placeholder": "Enter Password", "name": "psw", "required": "required", oninput: e => auth.setPassword(e.target.value) }),
                        button.login({ "type": "button", onclick: e => auth.login(e => document.getElementById('id01').style.display = 'none') },
                            "Login"
                        ),
                        label(
                            [
                                input({ "type": "checkbox", "checked": "checked", "name": "remember" }),
                                " Remember me "
                            ]
                        )
                    ]),
                    div.container({ "style": { "background-color": "#f1f1f1" } }, [
                        button.cancelbtn({ "type": "button", "onclick": e => document.getElementById('id01').style.display = 'none' },
                            "Cancel"
                        ),
                        span.psw([
                            "Forgot ",
                            a({ "href": "#" },
                                "password?"
                            )
                        ])
                    ])
                ])
            )
        ]
    }
};