import m from "mithril";
import S from "./settings";

import jwt_decode from "jwt-decode";


let user = undefined;

const auth = (() => {
    let email = "";
    let password = "";
    let token = null;
    let expMillis = -1;
    let eventBus = null;
    let userid = null;
    let userMessageSubscriptions = [];
    let connected = false;
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
            token = response.token;
            let ttt = jwt_decode(token);
            expMillis = ttt.exp * 1000;
            userid = ttt.crypto;
            if (cb) cb();
            setTimeout(refresh, -Date.now() + expMillis - 100);
        }, err => {
            connected = false;
            token = null;
            err_cb && err_cb(err);
        });
    };

    return {
        sessionRunningMillis: () => expMillis,
        login: refresh,
        logout: () => {
            eventBus && eventBus.close();
            m.request({
                method: "post",
                url: S.url("/api/logout")
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
            return token !== null;
        },
        token: () => {
            return token;
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
            let headers = options.headers || {};
            headers["Authorization"] = "Bearer " + token;
            options.headers = headers;
            return m.request({...options });
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