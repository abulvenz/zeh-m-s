package de.eismaenners.starter.auth;

import static de.eismaenners.starter.JsonUtils.json;
import static de.eismaenners.starter.JsonUtils.jsonTo;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.AuthProvider;
import io.vertx.ext.auth.User;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.Session;
import io.vertx.ext.web.handler.BodyHandler;

public class AuthRouter {

    private Vertx vertx;
    private UserService userService;
    private AuthProvider authProvider;

    public AuthRouter(Vertx vertx, UserService userService, AuthProvider authProvider) {
        this.vertx = vertx;
        this.userService = userService;
        this.authProvider = authProvider;
    }

    public static Router create(Vertx vertx, UserService userService, AuthProvider authProvider) {
        AuthRouter authRouter = new AuthRouter(vertx, userService, authProvider);
        return authRouter.router();
    }

    private Router router() {
        Router router = Router.router(vertx);
        router.route().handler(BodyHandler.create());

        router.post("/login").handler(this::login);
        router.post("/logout").handler(this::logout);
        router.get("/loggedin").handler(this::user);

        return router;
    }

    private void user(RoutingContext ctx) {
        ctx.response().end(json().put("loggedin", ctx.session().get("user") != null).encode());
    }

    private void logout(RoutingContext ctx) {
        ctx.clearUser();
        ctx.session().destroy();
        ctx.response().setStatusCode(200).end(json().encode());
    }

    private void login(RoutingContext ctx) {
        jsonTo(LoginDTO.class, ctx, login -> {
            authProvider.authenticate(JsonObject.mapFrom(login), loginAction -> {
                if (loginAction.succeeded()) {
                    User user = loginAction.result();
                    ctx.setUser(user);
                    Session session = ctx.session();
                    session.put("user", user);
                    if (session != null) {
                        session.regenerateId();
                    }
                    ctx.response().setStatusCode(200).end();
                } else {
                    ctx.fail(401);
                }
            });
        });
    }

    public static class LoginDTO {
        @JsonProperty
        private final String email;
        @JsonProperty
        private final String password;

        LoginDTO() {
            email = null;
            password = null;
        }

        public String email() {
            return email;
        }

        public String password() {
            return password;
        }
    }

}
