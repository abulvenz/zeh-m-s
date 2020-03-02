package de.eismaenners.starter.auth;

import static de.eismaenners.starter.JsonUtils.json;
import static de.eismaenners.starter.JsonUtils.jsonTo;

import com.fasterxml.jackson.annotation.JsonProperty;

import de.eismaenners.starter.UserService;
import io.vertx.core.Vertx;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;

public class AuthRouter {

    private Vertx vertx;
    private UserService userService;
    private JWTAuth authProvider;

    public AuthRouter(Vertx vertx, UserService userService, JWTAuth authProvider) {
        this.vertx = vertx;
        this.userService = userService;
        this.authProvider = authProvider;
    }

    public static Router create(Vertx vertx, UserService userService, JWTAuth authProvider) {
        AuthRouter authRouter = new AuthRouter(vertx, userService, authProvider);
        return authRouter.router();
    }

    private Router router() {
        Router router = Router.router(vertx);
        router.route().handler(BodyHandler.create());

        router.post("/login").handler(this::login);
        return router;
    }

    private void login(RoutingContext ctx) {
        System.out.println("1");
        jsonTo(LoginDTO.class, ctx, login -> {
            String token = authProvider.generateToken(json().put("sub", "paulo").put("someKey", "some value"),
                    new io.vertx.ext.jwt.JWTOptions().setExpiresInMinutes(1));
            ctx.response().setStatusCode(200).end(json().put("token", token).encode());
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
