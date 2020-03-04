package de.eismaenners.starter.auth;

import io.vertx.core.AsyncResult;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.AuthProvider;
import io.vertx.ext.auth.User;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.Session;
import io.vertx.ext.web.handler.impl.AuthHandlerImpl;
import io.vertx.ext.web.handler.impl.HttpStatusException;

public class CustomAuthHandler extends AuthHandlerImpl {

    private CustomAuthHandler(AuthProvider authProvider) {
        super(authProvider);
    }

    public static Handler<RoutingContext> create(AuthProvider authProvider) {
        return new CustomAuthHandler(authProvider);
    }

    @Override
    public void parseCredentials(RoutingContext context, Handler<AsyncResult<JsonObject>> handler) {

        if (context.user() != null) {
            System.out.println("A user is already here");
            context.next();
        } else {
            Session session = context.session();
            if (session != null) {
                if (session.get("user") != null) {
                    User user = session.get("user");
                    context.setUser(user);
                    context.next();
                } else {
                    context.fail(401);
                }
            } else {
                handler.handle(Future.failedFuture("No session - did you forget to include a SessionHandler?"));
            }
        }
    }
}
