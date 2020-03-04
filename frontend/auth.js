import m from "mithril";
import S from "./settings";

import eb from "vertx3-eventbus-client";

let user = undefined;

const auth = (() => {
    let email = "";
    let password = "";
    let eventBus = null;
    let userid = null;
    let loggedIn = false;

    m.request({
        url: S.url('/auth/loggedin'),
        withCredentials: true
    }).then(r => {
        loggedIn = r.loggedin;
        if (loggedIn) {
            connectEventBus();
        }
    })

    let userMessageSubscriptions = [];
    let connected = false;
    const connectEventBus = () => {
        eventBus = new eb(S.url("/protected/eventbus"), {
            token: "token"
        });
        eventBus.onopen = () => {
            connected = true;
            eventBus.registerHandler(
                userid, {
                    token: token
                },
                (err, msg) => {
                    notifications.push(msg);
                    //                    groups.invalidate();
                    userMessageSubscriptions.forEach(f => f(msg));
                    m.redraw();
                }
            );
            m.redraw();
        };
        eventBus.onclose = () => {
            eventBus = null;
            connected = false;
            m.redraw();
        };
    };

    const refresh = (cb, err_cb) => {
        if (email === "" || password === "") return;
        m.request({
            body: {
                email: email,
                password: password
            },
            url: S.url("/auth/login"),
            method: "post"
        }).then(response => {
            loggedIn = true;
            if (cb) cb();
            connectEventBus();
        }, err => {
            loggedIn = false;
            connected = false;
            err_cb && err_cb(err);
        });
    };

    return {
        login: refresh,
        logout: () => {
            loggedIn = false;
            eventBus && eventBus.close();
            m.request({
                method: "post",
                url: S.url("/auth/logout")
            }).then(response => (token = null));
        },
        signup: cb => {
            m.request({
                body: {
                    username: email,
                    description: "Empty",
                    email,
                    password,
                    color: "sepia",
                    language: "de"
                },
                url: S.url("/api/auth/register"),
                method: "post"
            }).then(cb);
        },
        isLoggedIn: () => {
            return loggedIn;
        },
        connected: () => connected,
        setEmail: email_ => {
            if (!!email_ && email_ !== "") email = email_;
        },
        setPassword: password_ => {
            if (!!password_ && password_ !== "") password = password_;
        },
        request: options => {
            options.url = S.url(options.url);
            return m.request({...options, withCredentials: true });
        },
        send: (topic, msg) => {
            eventBus &&
                eventBus.send(
                    topic, {
                        token,
                        token
                    },
                    msg
                );
        },
        subscribe: (topic, cb) => {
            eventBus &&
                eventBus.registerHandler(
                    topic, {
                        token,
                        token
                    },
                    cb
                );
        },
        subscribeToUserMessages: cb => {
            userMessageSubscriptions.push(cb);
        }
    };
})();

export default auth;